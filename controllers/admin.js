
import User from '../models/user.js';
import Parcel from '../models/parcel.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const adminStats = async (req, res) => {
  const usersCount   = await User.countDocuments();
  const agentsCount  = await User.countDocuments({ role: 'agent' });
  const parcelsCount = await Parcel.countDocuments();
  res.json({ users: usersCount, agents: agentsCount, parcels: parcelsCount });
};


export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

export const getAllParcels = async (req, res) => {
    try {
      const parcels = await Parcel.find()
        .populate('customer', 'name email')
        .populate('agent',    'name email');
      res.json(parcels);
    } catch (err) {
      console.error('Failed to get all parcels:', err);
      res.status(500).json({ message: 'Server error' });
    }
};
  
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');
  res.json(user);
};

/**
 * DELETE a user by ID
 */
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User deleted' });
};

/**
 * Assign parcel to agent (re-used from earlier)
 */
export const assignParcel = async (req, res) => {
  const { agent } = req.body;
  const parcel = await Parcel.findByIdAndUpdate(
    req.params.id,
    { agent },
    { new: true }
  );
  res.json(parcel);
};

export const getAnalytics = async (req, res) => {
    try {
      const dist = await Parcel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const statusCounts = {};
      dist.forEach(d => { statusCounts[d._id] = d.count; });
      res.json({ statusCounts });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ message: 'Server error' });
    }
};
  

  
  export const generateParcelReport = async (req, res) => {
    try {
      const parcels = await Parcel.find()
        .populate('customer', 'name email')
        .populate('agent',    'name email');
  
      // Build CSV
      const header = 'ID,Customer,Agent,Pickup,Delivery,Status,CreatedAt\n';
      const rows = parcels.map(p =>
        [
          p._id,
          `"${p.customer.name} <${p.customer.email}>"`,
          p.agent ? `"${p.agent.name} <${p.agent.email}>"` : '',
          `"${p.pickupAddress}"`,
          `"${p.deliveryAddress}"`,
          p.status,
          p.createdAt.toISOString()
        ].join(',')
      ).join('\n');
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="parcels_report.csv"');
      res.send(header + rows);
    } catch (err) {
      console.error('Report generation error:', err);
      res.status(500).json({ message: 'Server error' });
    }
};
  // CSV generator (existing) omitted for brevity

// === Excel report ===
export const generateParcelExcel = async (req, res) => {
    const parcels = await Parcel.find()
      .populate('customer', 'name email')
      .populate('agent',    'name email');
  
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Parcels');
    ws.columns = [
      { header: 'ID',           key: 'id',        width: 32 },
      { header: 'Customer',     key: 'customer',  width: 30 },
      { header: 'Agent',        key: 'agent',     width: 30 },
      { header: 'Pickup',       key: 'pickup',    width: 30 },
      { header: 'Delivery',     key: 'delivery',  width: 30 },
      { header: 'Status',       key: 'status',    width: 15 },
      { header: 'CreatedAt',    key: 'createdAt', width: 20 },
    ];
  
    parcels.forEach(p => {
      ws.addRow({
        id:         p._id.toString(),
        customer:   `${p.customer.name} <${p.customer.email}>`,
        agent:      p.agent ? `${p.agent.name} <${p.agent.email}>` : '',
        pickup:     p.pickupAddress,
        delivery:   p.deliveryAddress,
        status:     p.status,
        createdAt:  p.createdAt.toISOString(),
      });
    });
  
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="parcels_report.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    await wb.xlsx.write(res);
    res.end();
  };
  
  // === PDF report ===
  export const generateParcelPDF = async (req, res) => {
    const parcels = await Parcel.find()
      .populate('customer', 'name email')
      .populate('agent',    'name email');
  
    res.setHeader('Content-Disposition', 'attachment; filename="parcels_report.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
  
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);
  
    doc.fontSize(18).text('Parcels Report', { align: 'center' });
    doc.moveDown();
  
    parcels.forEach((p, i) => {
      doc.fontSize(12)
         .text(`${i + 1}. ID: ${p._id}`, { continued: true })
         .text(`  Status: ${p.status}`);
      doc.fontSize(10)
         .text(`   Customer: ${p.customer.name} <${p.customer.email}>`)
         .text(`   Agent: ${p.agent ? p.agent.name : '—'} ${p.agent ? `<${p.agent.email}>` : ''}`)
         .text(`   From: ${p.pickupAddress}`)
         .text(`   To:   ${p.deliveryAddress}`)
         .text(`   Created: ${p.createdAt.toLocaleString()}`)
         .moveDown(0.5);
    });
  
    doc.end();
  };