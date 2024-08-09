import Tutor from "../../domain/tutor";
import TutorRepo from "../../useCase/Interface/tutorRepo";
import tutorModel from "../database/tutorModel/tutorModel";
import OtpDocModel from "../database/commonModel/otpDocModel";
import courseModel from "../database/tutorModel/courseModel";
import ICourse from "../../domain/course/course";
import { log } from "console";
import ICategory from "../../domain/Icategory";
import categoryModel from "../database/adminModel/categoryModel";


class TutorRepository implements TutorRepo {

    //save tutor to DB 
    async saves(tutor:Tutor):Promise<Tutor>{
        const newTutor = new tutorModel(tutor)
        const saveTutor = await newTutor.save()
        console.log(saveTutor,"_id kittiyo");
        
        return saveTutor
    }

    // email finding from DB
async findByEmail(email: string): Promise<Tutor | null> {
    const res = await tutorModel.findOne({email:email});
    return res
}

  // find by id
  async findById(tutorId: string): Promise<Tutor | null> {
    const tutorData = await tutorModel.findById({_id:tutorId})
    console.log(tutorData,"find by id");
    return tutorData
    
  }   

// otp taking from db
async saveOtp(name: string, email: string, otp: number, role: string): Promise<any> {
    const newOtpDoc = new OtpDocModel({
        name:name,
        email:email,
        otp:otp,
        role:role,
        generatedAt:new Date()
    })
    const saveOtp = await newOtpDoc.save()
    console.log(saveOtp,"tutor otp data");
    
    return saveOtp
}

async findOtpByEmail(email: string,role:string): Promise<any> {
    const otpData = await OtpDocModel.findOne({email:email,role:role}).sort({generatedAt : -1});
    console.log(otpData,"repo otp data");
    return otpData
}

async forgotPassUpdate(
    email: string,
    hashPassword: string
  ): Promise<boolean> {
    const result = await tutorModel.updateOne(
      { email: email },
      { $set: { password: hashPassword } }
    );
    return result.modifiedCount > 0;
  }

  // course creation
  async createCourse(course: ICourse): Promise<ICourse> {
    const newCOurse = new courseModel(course)
    const saveCourse = await newCOurse.save()
    console.log(saveCourse,"repo save course");
    return saveCourse
  }
  async getCategory(): Promise<ICategory[]> {
    const getData = await categoryModel.find({is_listed:true})
    return getData
  }
}

export default TutorRepository;