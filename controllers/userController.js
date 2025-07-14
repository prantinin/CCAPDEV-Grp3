const timeLabels = require('../data/timeLabels');

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
      title: 'Labubuddies | View Profile',
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
      title: 'Labubuddies | Edit Profile',
      roleTitle: 'Student',
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading edit page.");
  }
};

// /editprofile/:idNum
exports.postEditProfile = async (req, res) => {
  try {
    const { description } = req.body;
    const idNum = parseInt(req.params.idNum);

    const result = await UserSchema.findOneAndUpdate(
      { idNum: idNum },
      { profDesc: description },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).send("User not found.");
    }

    res.redirect(`/viewprofile/${idNum}`);
    

  } catch (error) {
    console.error(error);
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