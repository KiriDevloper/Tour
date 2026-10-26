const router = require('express').Router();

// Auth
router.use(require('./auth/register'));
router.use(require('./auth/login'));
router.use(require('./auth/me'));

// Categories
router.use(require('./categories/getAll'));

// Places: route cụ thể (search) phải đứng TRƯỚC route có :id
router.use(require('./places/search'));
router.use(require('./places/getAll'));
router.use(require('./places/getById'));
router.use(require('./places/create'));
router.use(require('./places/update'));
router.use(require('./places/remove'));
router.use(require('./places/setVisibility'));
router.use(require('./places/addImage'));
router.use(require('./places/removeImage'));

// Thống kê cho trang admin
router.use(require('./admin/stats'));
router.use(require('./admin/statsOverview'));
router.use(require('./admin/spots'));
router.use(require('./admin/users'));
router.use(require('./admin/userStatus'));
router.use(require('./admin/userUpdate'));
router.use(require('./admin/userRemove'));

// Upload ảnh (chỉ admin)
router.use(require('./uploads/upload'));

// Foods: route cụ thể (search) phải đứng TRƯỚC route có :id
router.use(require('./foods/search'));
router.use(require('./foods/getAll'));
router.use(require('./foods/getById'));
router.use(require('./foods/create'));
router.use(require('./foods/update'));
router.use(require('./foods/remove'));
router.use(require('./foods/addSpot'));
router.use(require('./foods/updateSpot'));
router.use(require('./foods/removeSpot'));

// Activities
router.use(require('./activities/getByPlace'));
router.use(require('./activities/getAll'));
router.use(require('./activities/getById'));
router.use(require('./activities/create'));
router.use(require('./activities/update'));
router.use(require('./activities/remove'));

// Favorites
router.use(require('./favorites/getAll'));
router.use(require('./favorites/add'));
router.use(require('./favorites/remove'));

router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
