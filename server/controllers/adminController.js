const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const BLOG_FILE = path.join(DATA_DIR, 'blog.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const EARNINGS_FILE = path.join(DATA_DIR, 'earnings.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');

// Ensure data files exist
const initData = async () => {
  if (!require('fs').existsSync(DATA_DIR)) await fs.mkdir(DATA_DIR, { recursive: true });
  
  const ensureFile = async (filePath, defaultData) => {
    if (!require('fs').existsSync(filePath)) {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  };

  await ensureFile(BLOG_FILE, []);
  await ensureFile(REVIEWS_FILE, []);
  await ensureFile(ADMIN_FILE, { password: 'admin', securityQuestion: 'What is your favorite color?', securityAnswer: 'blue' });
  await ensureFile(STATS_FILE, { totalUsers: 1240, totalFiles: 5430, avgRating: 4.8 });
  await ensureFile(SETTINGS_FILE, []);
  await ensureFile(EARNINGS_FILE, { total: '1,240.50', adsense: '840.20', premium: '400.30' });
  await ensureFile(ANNOUNCEMENTS_FILE, { current: '' });
};
initData();

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const writeJson = async (file, data) => await fs.writeFile(file, JSON.stringify(data, null, 2));

// AUTH & ADMIN
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await readJson(ADMIN_FILE);
    if (admin.password === password) res.json({ success: true });
    else res.status(401).json({ error: 'Incorrect Password' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getSecurityQuestion = async (req, res) => {
  try {
    const admin = await readJson(ADMIN_FILE);
    res.json({ question: admin.securityQuestion });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { answer, newPassword } = req.body;
    const admin = await readJson(ADMIN_FILE);
    if (admin.securityAnswer.toLowerCase() === answer.toLowerCase()) {
      admin.password = newPassword;
      await writeJson(ADMIN_FILE, admin);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Incorrect answer' });
    }
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// STATS
exports.getStats = async (req, res) => {
  try { res.json(await readJson(STATS_FILE)); } 
  catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateStats = async (req, res) => {
  try {
    const newStats = req.body;
    await writeJson(STATS_FILE, newStats);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// BLOG
exports.getPosts = async (req, res) => {
  try { res.json(await readJson(BLOG_FILE)); } 
  catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    const data = await readJson(BLOG_FILE);
    const newPost = { id: Date.now().toString(), title, content, category, image, date: new Date().toISOString() };
    data.push(newPost);
    await writeJson(BLOG_FILE, data);
    res.status(201).json(newPost);
  } catch (err) { res.status(500).json({ error: 'Failed to create post' }); }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readJson(BLOG_FILE);
    const index = data.findIndex(p => p.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...req.body };
      await writeJson(BLOG_FILE, data);
      res.json(data[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) { res.status(500).json({ error: 'Failed to update post' }); }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    let data = await readJson(BLOG_FILE);
    data = data.filter(p => p.id !== id);
    await writeJson(BLOG_FILE, data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete post' }); }
};

// REVIEWS
exports.getReviews = async (req, res) => {
  try {
    const reviews = await readJson(REVIEWS_FILE);
    res.json(reviews.filter(r => r.approved || req.query.admin === 'true'));
  } catch (err) { res.status(500).json({ error: 'Failed to load reviews' }); }
};

exports.addReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const data = await readJson(REVIEWS_FILE);
    
    let reply = '';
    if (rating == 5) reply = "Thank you! We're glad you loved it! 🎉";
    else if (rating == 4) reply = "Thank you for your feedback! 😊";
    else if (rating == 3) reply = "Thank you! We'll work on improving! 🙏";
    else if (rating == 2) reply = "Sorry for the experience! We'll fix it soon! 😔";
    else reply = "We sincerely apologize! Our team will look into this immediately! 🙏";

    const newReview = { 
      id: Date.now().toString(), 
      name: name || 'Anonymous', 
      rating, 
      comment, 
      autoReply: reply,
      adminReply: '',
      approved: false, 
      date: new Date().toISOString() 
    };
    
    data.push(newReview);
    await writeJson(REVIEWS_FILE, data);
    res.status(201).json(newReview);
  } catch (err) { res.status(500).json({ error: 'Failed to add review' }); }
};

exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readJson(REVIEWS_FILE);
    const review = data.find(r => r.id === id);
    if (review) review.approved = true;
    await writeJson(REVIEWS_FILE, data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to approve review' }); }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    let data = await readJson(REVIEWS_FILE);
    data = data.filter(r => r.id !== id);
    await writeJson(REVIEWS_FILE, data);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to delete review' }); }
};

// SETTINGS
exports.getSettings = async (req, res) => {
  try { res.json(await readJson(SETTINGS_FILE)); } 
  catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateSettings = async (req, res) => {
  try {
    await writeJson(SETTINGS_FILE, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// EARNINGS
exports.getEarnings = async (req, res) => {
  try { res.json(await readJson(EARNINGS_FILE)); } 
  catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateEarnings = async (req, res) => {
  try {
    await writeJson(EARNINGS_FILE, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// ANNOUNCEMENTS
exports.getAnnouncement = async (req, res) => {
  try { res.json(await readJson(ANNOUNCEMENTS_FILE)); } 
  catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    await writeJson(ANNOUNCEMENTS_FILE, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
