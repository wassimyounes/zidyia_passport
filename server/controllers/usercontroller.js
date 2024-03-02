
 import asyncHandler from 'express-async-handler';
 import { check, validationResult } from 'express-validator';

 // desc: get all users
 //route: GET /user


 const getusers=asyncHandler(async(req,res)=>{
    const users=await User.find({});
    res.status(200).json({result:users.length,data:users});
});

export {getusers};
 // create user
// const createuser=asyncHandler(async(req,res)=>{
//     const first_name=req.body.first_name;
//     const last_name=req.body.last_name;
//     const address=req.body.address;
//     const password=req.body.password;
//     const phone_number=req.body.phone_number;
//     const user=await User.create({first_name,last_name,address,password,phone_number});
//     res.status(201).json({data:user});

// });
// export  { createuser };
// Create an array of validation middleware for createuser route
const createUserValidation = [
    check('first_name').notEmpty().withMessage('First name is required'),
    check('last_name').notEmpty().withMessage('Last name is required'),
    check('address').notEmpty().withMessage('Address is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).withMessage('Password must contain both letters and numbers'),
    check('phone_number').notEmpty().withMessage('Phone number is required'),
    check('email').isEmail().withMessage('Invalid email address'),
  ];
  
  // create user
  const createuser = asyncHandler(async (req, res) => {
    // Run validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { first_name, last_name, address, password, phone_number, email } = req.body;
  
    const user = await User.create({ first_name, last_name, address, password, phone_number, email });
    res.status(201).json({ data: user });
  });
  
  export { createuser, createUserValidation };




// get specific user


   const getuser=asyncHandler(async(req,res)=>{
    return;
    const {id}=req.params;
    const user=await User.findById(id);
    if(!user){
        res.status(404).json({msg:`no user for this id ${id}`})
    }
    res.status(200).json({data:user})
   })

   export {getuser};

//update specific category:

// const updateuser=asyncHandler(async(req,res)=>{
//     const {id}=req.params;
//     const {first_name}=req.body;
//     const {last_name}=req.body;
//     const {address}=req.body;
//     const {password}=req.body;
//     const {phone_number}=req.body;
//     const updateduser=await User.findOneAndUpdate(
//         {_id:id},
//         {first_name,last_name,address,password,phone_number},
//         {new:true})// return update it category after update
//         if(!updateduser){
//             res.status(404).json({msg:`no user for this is ${id}`})
//         }
//         res.status(200).json({data:updateduser})
// })
// export {updateuser}


// delete specific category
const deleteuser = asyncHandler(async(req,res) =>{

    const {id} = req.params;
    const deleteuser = await User.findOneAndDelete({_id:id});
    if(!deleteuser){
        res.status(404).json({msg:`NO user FOR THIS ID ${id}`});

    }
    res.status(200).json({msg: `the user  was deleted successfully`})
}) 
export {deleteuser}












