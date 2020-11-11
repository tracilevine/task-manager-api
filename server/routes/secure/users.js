const router = require('express').Router(),
  {
    getCurrentUser,
    updateCurrentUser,
    logoutUser,
    logoutAllDevices,
    deleteUser,
    uploadAvatar
  } = require('../../controllers/users');

router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.post('/logout', logoutUser);
router.post('/logoutall', logoutAllDevices);
router.delete('/', deleteUser);
// router.post('/avatar', uploadAvatar);

module.exports = router;
