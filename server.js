const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// قاعدة البيانات الأكواد
let licenses = {
    "VIP-KEY-1001": { owner: "مستخدم 1", status: "active", expires: "2030-12-31" }
};

// سجل النشاط
let userLogs = [];

// التحقق من الكود
app.post('/api/verify', (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey || !licenses[licenseKey]) {
        return res.json({ valid: false, message: "كود غير صالح!", resetKey: true });
    }

    const license = licenses[licenseKey];

    if (license.status !== 'active') {
        return res.json({ valid: false, message: "تم إيقاف هذا الكود من الأدمن!", resetKey: true });
    }

    res.json({ valid: true });
});

// تسجيل الأنشطة
app.post('/api/log', (req, res) => {
    userLogs.unshift({ ...req.body, time: new Date().toLocaleTimeString() });
    if (userLogs.length > 200) userLogs.pop();
    res.json({ success: true });
});

// روابط التحكم الخاصة بك
app.get('/admin/set-license', (req, res) => {
    const { key, status, owner } = req.query;
    if (!key) return res.send("يرجى تحديد key");

    if (!licenses[key]) licenses[key] = {};
    if (status) licenses[key].status = status; // active or blocked
    if (owner) licenses[key].owner = owner;

    res.send(`تم تغيير حالة الكود [${key}] إلى: ${licenses[key].status}`);
});

app.get('/admin/logs', (req, res) => {
    res.json(userLogs);
});

app.get('/admin/licenses', (req, res) => {
    res.json(licenses);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
