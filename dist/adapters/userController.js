"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class userConroller {
    constructor(userUseCase) {
        this._userUseCase = userUseCase;
    }
    // user sign up
    async signUp(req, res, next) {
        try {
            const userVerify = await this._userUseCase.checkExist(req.body.email);
            if (userVerify.data.status == true) {
                const sendOtp = await this._userUseCase.signup(req.body.name, req.body.email);
                return res.status(sendOtp.status).json(sendOtp.data);
            }
            else {
                return res.status(userVerify.status).json(userVerify.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // otp verification
    async verifyOTP(req, res, next) {
        try {
            const data = req.body;
            const OTPverification = await this._userUseCase.verify(data);
            if (OTPverification.status == 400) {
                return res
                    .status(OTPverification.status)
                    .json({ message: OTPverification.message });
            }
            if (OTPverification.data && OTPverification.status == 200) {
                const savedUser = await this._userUseCase.saveUser(OTPverification.data);
                return res
                    .status(200)
                    .json({ message: "User verification successfully", data: savedUser });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // login
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this._userUseCase.login(email, password);
            return res.status(user.status).json(user.data);
        }
        catch (error) {
            next(error);
        }
    }
    // resendOTP
    async resendOtp(req, res, next) {
        try {
            const { name, email } = req.body;
            const resendOTP = await this._userUseCase.resend_otp(name, email);
            return res.status(resendOTP.status).json(resendOTP.data);
        }
        catch (error) {
            next(error);
        }
    }
    // google sign up or login
    async googleUse(req, res, next) {
        try {
            const { name, email, phone, password, isGoogled } = req.body;
            const checkExist = await this._userUseCase.checkExist(email);
            if (checkExist.data.status == true) {
                const data = {
                    name: name,
                    email: email,
                    phone: phone,
                    password: password,
                    isGoogle: isGoogled,
                };
                await this._userUseCase.saveUser(data);
                const user = await this._userUseCase.login(email, password);
                return res.status(user.status).json(user.data);
            }
            else if (checkExist.data.status == false) {
                const user = await this._userUseCase.login(email, password);
                return res.status(user.status).json(user.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // forgotpassword
    async forgotPass(req, res, next) {
        try {
            const email = req.body.email;
            const user = await this._userUseCase.forgotPassword(email);
            if (user.status == 403) {
                return res.status(user.status).json(user.data);
            }
            else if (user.status == 200) {
                return res.status(user.status).json(user.data);
            }
            else {
                return res.status(user.status).json(user.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // forgot pass otp verify
    async forgotOTPverify(req, res, next) {
        try {
            const data = req.body;
            const verify = await this._userUseCase.verify(data);
            if (verify.status == 400) {
                return res.status(verify.status).json({ message: verify.message });
            }
            else if (verify.status == 200) {
                return res.status(verify.status).json(verify);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // reset password
    async resetPassword(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await this._userUseCase.resetPassword(email, password);
            if (result.status == 200) {
                return res.status(result.status).json({ message: result.message });
            }
            else {
                return res.status(result.status).json({ message: result.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // homePage
    async homePage(req, res, next) {
        try {
            const userId = req.query.id;
            const user = await this._userUseCase.getUser(userId);
            console.log(user);
            if (user.status == 200) {
                return res.status(user.status).json(user.data?.data);
            }
            else {
                return res.status(user.status).json(user.data?.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // get all courses list
    async getCourses(req, res, next) {
        try {
            const { page = 1, limit = 10, searchTerm = "", category = "", } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const courses = await this._userUseCase.allCourseGet(Number(limit), skip, searchTerm, category);
            if (courses) {
                const totalItems = await this._userUseCase.countCourses(searchTerm, category);
                return res.status(courses.status).json({ ...courses.data, totalItems });
            }
            else {
                return res.status(404).json({ message: "No courses found" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // get view course
    async ViewCourses(req, res, next) {
        try {
            const id = req.query.id;
            const userid = req.query.userId;
            const courseViewData = await this._userUseCase.getViewCourse(id, userid);
            if (courseViewData) {
                return res.status(courseViewData.status).json(courseViewData.data);
            }
            else {
                return res.status(404).json({ message: "No course found" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // create payment
    async coursePayment(req, res, next) {
        try {
            const { courseId } = req.body;
            const paymentDetails = await this._userUseCase.createPyment(courseId);
            if (paymentDetails) {
                return res.status(200).json(paymentDetails.response);
            }
            else {
                return res
                    .status(400)
                    .json({ message: "something went wrong the creation of payment" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // paymentCompleted
    async paymentCompleted(req, res, next) {
        try {
            console.log("paymentCompleted");
            const { data } = req.body;
            const successPayment = await this._userUseCase.successPayment(data);
            if (successPayment) {
                return res.status(200).json(successPayment);
            }
            else {
                return res.status(400).json(successPayment);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // sendUserMsg
    async storeUserMsg(req, res, next) {
        try {
            const { message, userId, instructorId, username, instructorName } = req.body;
            const saveMsg = await this._userUseCase.storeUserMsg(message, userId, instructorId, username, instructorName);
            if (saveMsg) {
                return res.status(saveMsg.status).json(saveMsg);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // uploadReviews
    async uploadReviews(req, res, next) {
        try {
            const { rating, feedback, courseId, userId, userName } = req.body;
            const reviewUpload = await this._userUseCase.reviewsUpload(courseId, userId, userName, feedback, rating);
            if (reviewUpload) {
                return res.status(reviewUpload.status).json(reviewUpload);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // reviewsFetch
    async getReviews(req, res, next) {
        try {
            const courseId = req.query.courseId;
            const getReview = await this._userUseCase.reviewsFetch(courseId);
            if (getReview) {
                return res.status(getReview.status).json(getReview);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // fetchAssignments
    async fetchAssignments(req, res, next) {
        try {
            const courseId = req.query.courseId;
            const assignmentsData = await this._userUseCase.getAssignments(courseId);
            return res.status(assignmentsData.status).json(assignmentsData.data);
        }
        catch (error) {
            next(error);
        }
    }
    // getInstructor
    async getInstructor(req, res, next) {
        try {
            const instructorId = req.query.instructorId;
            const instructorData = await this._userUseCase.getInstructorDetails(instructorId);
            return res.status(instructorData.status).json(instructorData.data);
        }
        catch (error) {
            next(error);
        }
    }
    // submitTheReport
    async submitTheReport(req, res, next) {
        try {
            const { courseId, userId, formState } = req.body;
            const reportResponse = await this._userUseCase.reportingCourse(courseId, userId, formState);
            res.status(reportResponse.status).json(reportResponse);
        }
        catch (error) {
            next(error);
        }
    }
    // getRating
    async getRating(req, res, next) {
        try {
            const getRate = await this._userUseCase.getRates();
            return res.status(getRate.status).json(getRate);
        }
        catch (error) {
            next(error);
        }
    }
    // getStudentInfo
    async getStudentInfo(req, res, next) {
        try {
            const userId = req.query.userId;
            const userData = await this._userUseCase.getUser(userId);
            if (userData.status == 200) {
                return res.status(userData.status).json(userData.data?.data);
            }
            else {
                return res.status(userData.status).json(userData.data?.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // updatedUserData
    async updatedUserData(req, res, next) {
        try {
            const { userId, name, email, phoneNumber } = req.body;
            const profileImage = req.file;
            const saveData = await this._userUseCase.updateEditData(userId, name, email, phoneNumber, profileImage);
            if (saveData.status === 200) {
                return res.status(saveData.status).json({
                    message: saveData.message,
                    updatedUser: saveData.updatedUser,
                });
            }
            else {
                return res.status(saveData.status).json({ message: saveData.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // changePassword
    async changePassword(req, res, next) {
        try {
            const { userId, currentPassword, newPassword } = req.body;
            const result = await this._userUseCase.updatePassword(userId, currentPassword, newPassword);
            return res.status(result?.status).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // getCategories
    async getCategories(req, res, next) {
        try {
            const categories = await this._userUseCase.getCategory();
            if (categories) {
                return res.status(categories.status).json(categories.data);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // getHomePageData
    async getHomePageData(req, res, next) {
        try {
            const getHomeData = await this._userUseCase.getDataToHome();
            return res.status(getHomeData.status).json(getHomeData);
        }
        catch (error) {
            next(error);
        }
    }
    // getEntrolledCourse
    async entrolledCourseGet(req, res, next) {
        try {
            const userId = req.query.userId;
            const entrolledCourses = await this._userUseCase.enrolledCourseData(userId);
            return res.status(entrolledCourses.status).json(entrolledCourses.data);
        }
        catch (error) {
            next(error);
        }
    }
    // getInitialMsg
    async getInitialMsg(req, res, next) {
        try {
            const senderId = req.query.senderId;
            const receiverId = req.query.receiverId;
            const initialMsgs = await this._userUseCase.getPreviousMsgs(senderId, receiverId);
            return res.status(initialMsgs.status).json(initialMsgs.data);
        }
        catch (error) {
            next(error);
        }
    }
    // getWallet
    async getWallet(req, res, next) {
        try {
            const { userid } = req.query;
            const userId = req.query.userId;
            const wallet = await this._userUseCase.getWalletData(userId);
            return res.status(wallet.status).json(wallet);
        }
        catch (error) {
            next(error);
        }
    }
    // paymentWallet
    async paymentWallet(req, res, next) {
        try {
            const { userId, instructorId, courseId, coursePrice, courseName } = req.body;
            const walletPaymentResult = await this._userUseCase.successWalletPayment(userId, instructorId, courseId, coursePrice, courseName);
            if (walletPaymentResult.status == 200) {
                return res.status(walletPaymentResult.status).json(walletPaymentResult);
            }
            else {
                return res.status(walletPaymentResult.status).json(walletPaymentResult);
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = userConroller;
