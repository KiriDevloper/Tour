const router = require('express').Router();
const { getFood } = require('../../utils/foods');

// GET /api/foods/:id   (kèm danh sách quán/nơi thưởng thức và tọa độ)
router.get('/foods/:id', (req, res) => {
  const food = getFood(req, Number(req.params.id));
  if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  res.json(food);
});

module.exports = router;
