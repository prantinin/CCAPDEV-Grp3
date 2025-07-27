const UserSchema = require('../models/Users');
const ReserveSchema = require('../models/Reservations');

const timeLabels = require('../data/timeLabels');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// /viewprofile/:idNum
exports.getViewProfileStudent = async (req, res) => {
  try {
    const idNum = parseInt(req.params.idNum);
    const currentUserIdNum = 12406543; // TODO: Replace with session
    
    if (isNaN(idNum)) {
      return res.status(400).render('error', { title: 'Invalid User ID' });
    }

    const [user, reservations] = await Promise.all([
      UserSchema.findOne({ idNum: idNum }).lean(),
      ReserveSchema.find({ userIdNum: idNum }).lean()
    ]);
    
    if (!user) {
      return res.status(404).render('error', { title: 'User Not Found' });
    }
    
    const transformedReservations = reservations.map(reservation => {
      const timeSlotIndex = parseInt(reservation.timeSlot);
      return {
        ...reservation,
        timeSlotDisplay: timeLabels[timeSlotIndex] || 'Invalid time slot'
      };
    });

    const isOwnProfile = idNum === currentUserIdNum;

    res.render('viewprofile', {
      title: 'Labubuddy | View Profile',
      roleTitle: 'Student',
      user: user,
      reservations: transformedReservations,
      isOwnProfile: isOwnProfile
    });

  } catch (error) {
    console.error("View Profile Error:", error);
    res.status(500).render('error', { title: 'Server Error' });
  }
};

// /profile/:email
exports.getViewProfileTech = async (req, res) => {
  const user = await User.findOne({ email: req.params.email }).lean();
  if (user) {
    res.render('viewprofile', { user });
  } else {
    res.status(404).render('error', { title: 'User Not Found' });
  }
};

// /editprofile/:idNum
exports.getEditProfile = async (req, res) => {
  const idNum = parseInt(req.params.idNum);

  try {
    const user = await UserSchema.findOne({ idNum: idNum }).lean();
    
    if (!user) {
      return res.status(404).send("User not found.");
    }
    
    res.render('editprofile', {
      title: 'Labubuddy | Edit Profile',
      roleTitle: 'Student',
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading edit page.");
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const idNum = req.params.idNum;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${idNum}_${timestamp}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
  
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

exports.uploadProfilePicture = upload.single('profilePicture');

exports.postEditProfile = async (req, res) => {
  try {
    const { description } = req.body;
    const idNum = parseInt(req.params.idNum);
    
    const updateData = {};
    
    if (description !== undefined) {
      updateData.profDesc = description;
    }
    
    if (req.file) {
 
      const currentUser = await UserSchema.findOne({ idNum: idNum });
      
      if (currentUser && currentUser.profPic) {
        const oldPicturePath = path.join('public', currentUser.profPic);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      
      updateData.profPic = `/uploads/profiles/${req.file.filename}`;
    }
    
    const result = await UserSchema.findOneAndUpdate(
      { idNum: idNum },
      updateData,
      { new: true }
    );
    
    if (!result) {
      
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).send("User not found.");
    }

    res.redirect(`/viewprofile/${idNum}`);
    
  } catch (error) {
    console.error(error);
    
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).send("Error saving profile.");
  }
};

// /searchusers
exports.getSearchUsers = async (req, res) => {
  try {
    const currentUserIdNum = 12406543;
    
    const users = await UserSchema.find({ 
      idNum: { $ne: currentUserIdNum }
    }).lean();
    
    res.render('searchusers', {
      title: 'LABubuddy | Search Users',
      roleTitle: 'Student',
      users: users,
      currentUserIdNum: currentUserIdNum 
    });
  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).render('error', { title: 'Server Error' });
  }
};

// /searchusers
exports.postSearchUsers = async (req, res) => {
  try {
    const { searchName, roleFilter } = req.body;
    
   
    let searchQuery = {};
    
    
    if (searchName && searchName.trim() !== '') {
      const trimmedSearch = searchName.trim();
      const nameParts = trimmedSearch.split(/\s+/); 
      
      if (nameParts.length === 1) {
       
        searchQuery.$or = [
          { fName: { $regex: nameParts[0], $options: 'i' } },
          { lName: { $regex: nameParts[0], $options: 'i' } }
        ];
      } else if (nameParts.length === 2) {
       
        searchQuery.$and = [
          { fName: { $regex: nameParts[0], $options: 'i' } },
          { lName: { $regex: nameParts[1], $options: 'i' } }
        ];
      } else {
        searchQuery.$or = [
          {
            $and: [
              { fName: { $regex: nameParts[0], $options: 'i' } },
              { lName: { $regex: nameParts.slice(1).join(' '), $options: 'i' } }
            ]
          },
      
          {
            $and: [
              { fName: { $regex: nameParts.slice(0, -1).join(' '), $options: 'i' } },
              { lName: { $regex: nameParts[nameParts.length - 1], $options: 'i' } }
            ]
          },
          
          { fName: { $regex: trimmedSearch, $options: 'i' } },
          { lName: { $regex: trimmedSearch, $options: 'i' } }
        ];
      }
    }
    
   
    if (roleFilter && roleFilter !== 'all') {
      if (roleFilter === 'technician') {
        searchQuery.isTech = true;
      } else if (roleFilter === 'student') {
        searchQuery.isTech = false;
      }
    }
    
   
    const currentUserIdNum = 12406543; // Hardcoded
    searchQuery.idNum = { $ne: currentUserIdNum };
    
    const users = await UserSchema.find(searchQuery).lean();
    
    res.render('searchusers', {
      title: 'LABubuddy | Search Users',
      roleTitle: 'Student',
      users: users,
      searchName: searchName,
      roleFilter: roleFilter
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).render('error', { title: 'Server Error' });
  }
};

// /deleteAccount
exports.deleteAccount = async (req, res) => {
 try {
   const idNum = parseInt(req.params.idNum);
   const hardcodedUserId = 12406543;
   
   if (idNum !== hardcodedUserId) {
     return res.status(403).json({ error: 'Unauthorized' });
   }
   
   const deletedReservations = await ReserveSchema.deleteMany({ userIdNum: idNum });
   
   const deletedUser = await UserSchema.findOneAndDelete({ idNum: idNum });
   
   if (!deletedUser) {
     return res.status(404).json({ error: 'User not found' });
   }
   
   res.status(200).json({ 
     message: 'Account deleted successfully', 
     reservationsDeleted: deletedReservations.deletedCount 
   });
   
 } catch (error) {
   console.error('Delete Account Error:', error);
   res.status(500).json({ error: 'Server error', details: error.message });
 }
};