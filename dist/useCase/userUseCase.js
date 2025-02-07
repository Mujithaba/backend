"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserUseCase {
    constructor(userRepository, encryptPassword, generateOtp, generateSendMail, jwtToken, s3Uploader, razorpay) {
        this._userRepository = userRepository;
        this._encryptPassword = encryptPassword;
        this._generateOtp = generateOtp;
        this._generateSendMail = generateSendMail;
        this._jwtToken = jwtToken;
        this._S3Uploader = s3Uploader;
        this._razorpay = razorpay;
    }
    // email exist checking when register
    async checkExist(email) {
        const userExist = await this._userRepository.findByEmail(email);
        if (userExist) {
            return {
                status: 400,
                data: {
                    status: false,
                    message: "User already exist;",
                },
            };
        }
        else {
            return {
                status: 200,
                data: {
                    status: true,
                    message: "User does not exist;",
                },
            };
        }
    }
    // signup user usecase
    async signup(name, email) {
        const otp = this._generateOtp.createOtp();
        console.log(otp, "OTP");
        const role = "user";
        await this._userRepository.saveOtp(name, email, otp, role);
        this._generateSendMail.sendMail(name, email, otp, role);
        return {
            status: 200,
            data: {
                status: true,
                message: "Verification otp sent to your email",
            },
        };
    }
    // otp verification case
    async verify(data) {
        const otpDetailes = await this._userRepository.findOtpByEmail(data.roleData.email, data.role);
        if (otpDetailes === null) {
            return { status: 400, message: "Invalid or expired OTP" };
        }
        if (otpDetailes.otp !== data.otp) {
            return { status: 400, message: "Invalid OTP" };
        }
        return {
            status: 200,
            message: "OTP verificaton successfully",
            data: data.roleData,
        };
    }
    async saveUser(user) {
        const hashPassword = await this._encryptPassword.encryptPassword(user.password);
        user.password = hashPassword;
        const userSave = await this._userRepository.saves(user);
        return {
            status: 201,
            data: userSave,
        };
    }
    async login(email, password) {
        const user = await this._userRepository.findByEmail(email);
        let token = "";
        if (user) {
            let data = {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBlock: user.isBlocked,
                isAdmin: user.isAdmin,
                isGoogle: user.isGoogle,
            };
            if (user.isBlocked) {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "You have been blocked by admin!",
                        token: "",
                    },
                };
            }
            const passwordMatch = await this._encryptPassword.compare(password, user.password);
            if (passwordMatch && user.isAdmin) {
                token = this._jwtToken.generateToken(user._id, "admin");
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: data,
                        token,
                        isAdmin: true,
                    },
                };
            }
            if (passwordMatch) {
                token = this._jwtToken.generateToken(user._id, "user");
                return {
                    status: 200,
                    data: {
                        status: true,
                        message: data,
                        token,
                    },
                };
            }
            else {
                return {
                    status: 400,
                    data: {
                        status: false,
                        message: "Invalid email or password",
                        token: "",
                    },
                };
            }
        }
        else {
            return {
                status: 400,
                data: {
                    status: false,
                    message: "Invalid email or password",
                    token: "",
                },
            };
        }
    }
    async resend_otp(name, email) {
        const otp = this._generateOtp.createOtp();
        console.log(otp, "resend OTP");
        const role = "user";
        await this._userRepository.saveOtp(name, email, otp, role);
        this._generateSendMail.sendMail(name, email, otp, role);
        return {
            status: 200,
            data: {
                status: true,
                message: " Resend otp sent to your email",
            },
        };
    }
    async forgotPassword(email) {
        const userExist = await this._userRepository.findByEmail(email);
        if (userExist?.isGoogle) {
            return {
                status: 403,
                data: {
                    status: false,
                    message: "You cannot change the password because you used Google registration",
                    userData: userExist,
                },
            };
        }
        if (userExist) {
            const otp = this._generateOtp.createOtp();
            const role = "user";
            await this._generateSendMail.sendMail(userExist.name, userExist.email, otp, role);
            await this._userRepository.saveOtp(userExist.name, userExist.email, otp, role);
            return {
                status: 200,
                data: {
                    status: true,
                    message: "Verification OTP sent to your Email",
                    userData: userExist,
                },
            };
        }
        else {
            return {
                status: 400,
                data: {
                    status: false,
                    message: "Email not registered",
                },
            };
        }
    }
    async resetPassword(email, password) {
        const hashPassword = await this._encryptPassword.encryptPassword(password);
        const result = await this._userRepository.forgotPassUpdate(email, hashPassword);
        if (result) {
            return {
                status: 200,
                message: "Password changed successfully",
            };
        }
        else {
            return {
                status: 400,
                message: "Something went wrong Password change,Please try later",
            };
        }
    }
    // taking userData by id
    async getUser(userId) {
        const userData = await this._userRepository.findById(userId);
        let profileUril = "nopic";
        if (userData) {
            if (userData.img && userData.img != "nopic") {
                profileUril = await this._S3Uploader.getSignedUrl(userData.img);
            }
            return {
                status: 200,
                data: {
                    message: "Getting the user data",
                    data: { userData, profileUril },
                },
            };
        }
        else {
            return {
                status: 400,
                message: "Something went wrong getting the user data",
            };
        }
    }
    // get all courses
    async allCourseGet(limit, skip, searchTerm, category) {
        const courses = await this._userRepository.getCourses(limit, skip, searchTerm, category);
        const getCourses = await this.s3GetFunction(courses);
        if (getCourses) {
            return {
                status: 200,
                data: {
                    getCourses,
                },
            };
        }
        else {
            return {
                status: 400,
                data: {
                    message: "Something went wrong fetching courses",
                },
            };
        }
    }
    async countCourses(searchTerm, category) {
        const itemsCount = await this._userRepository.coursesCount(searchTerm, category);
        return itemsCount;
    }
    // url thorugh data fetching from s3
    async s3GetFunction(getCourses) {
        const coursesWithSignedUrls = await Promise.all(getCourses.map(async (course) => {
            let thumbnailUrl = "";
            let trailerUrl = "";
            if (course.thambnail_Img) {
                try {
                    thumbnailUrl = await this._S3Uploader.getSignedUrl(course.thambnail_Img);
                }
                catch (error) {
                    console.error(`Error generating signed URL for thumbnail: ${course.thambnail_Img}`, error);
                }
            }
            if (course.trailer_vd) {
                try {
                    trailerUrl = await this._S3Uploader.getSignedUrl(course.trailer_vd);
                }
                catch (error) {
                    console.error(`Error generating signed URL for trailer: ${course.trailer_vd}`, error);
                }
            }
            const moduleWithSignedUrls = await Promise.all((course.chapters || []).map(async (module) => {
                const lecturewithSignedUrls = await Promise.all((module.lectures || []).map(async (lecture) => {
                    let pdfUrl = "";
                    let videoUrl = "";
                    if (lecture.pdf) {
                        try {
                            pdfUrl = await this._S3Uploader.getSignedUrl(lecture.pdf);
                        }
                        catch (error) {
                            console.error(`Error generating signed URL  for lecture pdf:${lecture.pdf}`, error);
                        }
                    }
                    if (lecture.video) {
                        try {
                            videoUrl = await this._S3Uploader.getSignedUrl(lecture.video);
                        }
                        catch (error) {
                            console.error(`error generating signed Url for lecture video:${lecture.video}`, error);
                        }
                    }
                    return {
                        ...lecture,
                        lecturePdf: pdfUrl,
                        lectureVideo: videoUrl,
                    };
                }));
                return {
                    ...module,
                    name: module.name,
                    lectures: lecturewithSignedUrls,
                };
            }));
            return {
                ...course,
                thumbnailSignedUrl: thumbnailUrl,
                trailerSignedUrl: trailerUrl,
                modules: moduleWithSignedUrls,
            };
        }));
        return coursesWithSignedUrls;
    }
    //individual getViewCourse
    async getViewCourse(course_id, userid) {
        const { getCourses, isPurchased, getWallet } = await this._userRepository.getCourseView(course_id, userid);
        const getViewCourses = await this.s3GenerateForViewCourse(getCourses);
        if (getViewCourses) {
            return {
                status: 200,
                data: {
                    getViewCourses,
                    isPurchased,
                    getWallet,
                },
            };
        }
        else {
            return {
                status: 400,
                data: {
                    message: "Something went wrong fetching courses",
                },
            };
        }
    }
    // individual courseview
    async s3GenerateForViewCourse(course) {
        console.log("Processing course...");
        let thumbnailUrl = "";
        let trailerUrl = "";
        if (course.thambnail_Img) {
            try {
                thumbnailUrl = await this._S3Uploader.getSignedUrl(course.thambnail_Img);
            }
            catch (error) {
                console.error(`Error generating signed URL for thumbnail: ${course.thambnail_Img}`, error);
            }
        }
        if (course.trailer_vd) {
            try {
                trailerUrl = await this._S3Uploader.getSignedUrl(course.trailer_vd);
            }
            catch (error) {
                console.error(`Error generating signed URL for trailer: ${course.trailer_vd}`, error);
            }
        }
        const moduleWithSignedUrls = await Promise.all((course.chapters || []).map(async (module) => {
            const lecturewithSignedUrls = await Promise.all((module.lectures || []).map(async (lecture) => {
                let pdfUrl = "";
                let videoUrl = "";
                if (lecture.pdf) {
                    try {
                        pdfUrl = await this._S3Uploader.getSignedUrl(lecture.pdf);
                    }
                    catch (error) {
                        console.error(`Error generating signed URL for lecture PDF: ${lecture.pdf}`, error);
                    }
                }
                if (lecture.video) {
                    try {
                        videoUrl = await this._S3Uploader.getSignedUrl(lecture.video);
                    }
                    catch (error) {
                        console.error(`Error generating signed URL for lecture video: ${lecture.video}`, error);
                    }
                }
                return {
                    ...lecture,
                    lecturePdf: pdfUrl,
                    lectureVideo: videoUrl,
                };
            }));
            return {
                ...module,
                name: module.name,
                lectures: lecturewithSignedUrls,
            };
        }));
        return {
            ...course,
            thumbnailSignedUrl: thumbnailUrl,
            trailerSignedUrl: trailerUrl,
            modules: moduleWithSignedUrls,
        };
    }
    // create course
    async createPyment(courseId) {
        const courseData = await this._userRepository.findCourseById(courseId);
        const price = courseData?.price?.toString() || "0";
        const amountInPaise = parseInt(price);
        const options = {
            amount: amountInPaise * 100,
            currency: "INR",
            receipt: `receipt_${courseId}`,
            payment_capture: 1,
        };
        const response = await this._razorpay.orders.create(options);
        return {
            response,
        };
    }
    // successPayment
    async successPayment(data) {
        const courseData = await this._userRepository.findCourseById(data.courseID);
        const paymentData = {
            userId: data.userID,
            courseId: data.courseID,
            instructorID: data.instructorId,
            price: courseData?.price,
        };
        const savePayment = await this._userRepository.savePayments(paymentData);
        if (savePayment) {
            return {
                status: 200,
                message: "Payment successfully completed",
            };
        }
        else {
            return {
                status: 400,
                message: "Something went wrong in the payment,Please Check that",
            };
        }
    }
    // storeUserMsg
    async storeUserMsg(message, userId, instructorId, username, instructorName) {
        const msg = {
            senderId: userId,
            receiverId: instructorId,
            message: message,
        };
        const storeMsg = await this._userRepository.storeMesssage(msg);
        let lastMsg = {
            senderName: username,
            instructorName: instructorName,
            senderId: userId,
            receiverId: instructorId,
            lastMessage: message,
        };
        const conversationMsg = await this._userRepository.createConversation(lastMsg);
        if (storeMsg) {
            return {
                status: 200,
                message: "msg is stored",
            };
        }
        else {
            return {
                status: 400,
                message: "something went wrong the msg storing",
            };
        }
    }
    // reviewsUpload
    async reviewsUpload(courseId, userId, userName, feedback, rating) {
        const data = {
            courseId: courseId,
            userId: userId,
            userName: userName,
            feedback: feedback,
            rating: rating,
        };
        const uploadReviews = await this._userRepository.uploadReview(data);
        if (uploadReviews) {
            return {
                status: 200,
                message: "your review added successfully",
            };
        }
        else {
            return {
                status: 400,
                message: "Something wrong adding the review!",
            };
        }
    }
    // reviewsFetch
    async reviewsFetch(courseId) {
        const getReviews = await this._userRepository.getReview(courseId);
        if (getReviews) {
            return {
                status: 200,
                data: {
                    getReviews,
                },
            };
        }
        else {
            return {
                status: 400,
                data: {
                    message: "Something went wrong fetching reviews",
                },
            };
        }
    }
    // getAssignments
    async getAssignments(courseId) {
        const assignmentsFetch = await this._userRepository.fetchAssignments(courseId);
        const assignmentsWithUrlPromises = assignmentsFetch.map(async (assignment) => {
            const assignmentUrl = await this._S3Uploader.getSignedUrl(assignment.pdf_file);
            return {
                ...assignment,
                assignmentUrl,
            };
        });
        const assignmentsWithUrls = await Promise.all(assignmentsWithUrlPromises);
        return {
            status: 200,
            data: assignmentsWithUrls,
        };
    }
    // getInstructorDetails
    async getInstructorDetails(instructorId) {
        const getInstructor = await this._userRepository.fetchInstructor(instructorId);
        let instructorImgUrl = undefined;
        if (getInstructor.profileImg != "nopic") {
            instructorImgUrl = await this._S3Uploader.getSignedUrl(getInstructor.profileImg);
        }
        else {
            instructorImgUrl = "nopic";
        }
        return {
            status: 200,
            data: { getInstructor, instructorImgUrl },
        };
    }
    // reportingCourse
    async reportingCourse(courseId, userId, formState) {
        // Check if the user has already reported the course
        const hasUserReported = await this._userRepository.userReportExist(courseId, userId);
        if (hasUserReported) {
            return {
                status: 200,
                message: "You have already reported this course.",
                data: "AlreadyAdded",
            };
        }
        const reportAction = await this._userRepository.reportCourese(courseId, userId, formState.issueType, formState.description);
        if (reportAction) {
            return {
                status: 200,
                message: "Your report is successfully added",
            };
        }
        else {
            return {
                status: 400,
                message: "Something went wrong reporting, Please try later!",
            };
        }
    }
    // getRates
    async getRates() {
        const getRate = await this._userRepository.ratesGet();
        return {
            status: 200,
            getRate,
        };
    }
    // updateEditData
    async updateEditData(userid, name, email, phone, profileImage) {
        let uploadImg;
        if (profileImage) {
            uploadImg = await this._S3Uploader.uploadImage(profileImage);
        }
        const data = {
            name: name,
            email: email,
            phone: phone,
        };
        if (uploadImg) {
            data.img = uploadImg;
        }
        const updatedUser = await this._userRepository.saveEditData(userid, data);
        if (updatedUser) {
            return {
                status: 200,
                message: "Updated Successfully",
                updatedUser: updatedUser,
            };
        }
        else {
            return {
                status: 400,
                message: "Something went wrong updating, Try later",
            };
        }
    }
    // updatePassword
    async updatePassword(userId, currentPassword, newPassword) {
        const userData = await this._userRepository.findUser(userId);
        let result;
        if (!userData) {
            return {
                status: 404,
                message: "User not found",
            };
        }
        const matchingCurrent = await this._encryptPassword.compare(currentPassword, userData.password);
        if (matchingCurrent) {
            // Encrypt the new password
            const hashedNewPassword = await this._encryptPassword.encryptPassword(newPassword);
            // Update the password in the repository
            result = await this._userRepository.changedPassword(userId, hashedNewPassword);
            if (result) {
                return {
                    status: 200,
                    message: "Password changed successfully",
                };
            }
            else {
                return {
                    status: 400,
                    message: "Failed to change password",
                };
            }
        }
        else {
            return {
                status: 400,
                message: "The entered current password is incorrect",
            };
        }
    }
    // get categories
    async getCategory() {
        const getCateData = await this._userRepository.getCategory();
        if (getCateData) {
            return {
                status: 200,
                data: {
                    getCateData,
                },
            };
        }
        else {
            return {
                status: 400,
                data: {
                    message: "Something went wrong fetching category",
                },
            };
        }
    }
    // getDataToHome
    async getDataToHome() {
        try {
            const ratedCourses = await this._userRepository.ratedCourseHome();
            let instructorArray = [];
            const instructorCache = new Map();
            const topCoursesPromises = ratedCourses.map(async (course) => {
                try {
                    const getCourses = await this._userRepository.findCourseById(course._id);
                    if (!getCourses) {
                        console.log(`Course not found for id: ${course._id}`);
                        return null;
                    }
                    const thumbnailUrl = await this._S3Uploader.getSignedUrl(getCourses.thambnail_Img);
                    let instructorDataPromise = instructorCache.get(getCourses.instructor_id);
                    if (!instructorDataPromise) {
                        instructorDataPromise = this._userRepository
                            .findInstructorById(getCourses.instructor_id)
                            .then(async (instructorData) => {
                            const profileUrl = instructorData.instructorImg === "nopic"
                                ? "nopic"
                                : await this._S3Uploader.getSignedUrl(instructorData.instructorImg);
                            return { ...instructorData, profileUrl };
                        });
                        instructorCache.set(getCourses.instructor_id, instructorDataPromise);
                    }
                    const instructorData = await instructorDataPromise;
                    if (!instructorArray.some((instructor) => instructor._id.toString() === instructorData._id.toString())) {
                        instructorArray.push(instructorData);
                    }
                    return {
                        _id: getCourses._id,
                        courseName: getCourses.title,
                        thumbnail: thumbnailUrl,
                        averageRating: course.averageRating,
                        instructor: {
                            _id: instructorData._id,
                            name: instructorData.name,
                            profileUrl: instructorData.profileUrl,
                            position: instructorData.position,
                        },
                    };
                }
                catch (error) {
                    console.error(`Error processing course ${course._id}:`, error);
                    return null;
                }
            });
            const topCourses = await Promise.all(topCoursesPromises);
            const homeData = topCourses.filter((course) => course !== null);
            if (homeData.length > 0) {
                return {
                    status: 200,
                    data: { homeData, instructorArray },
                };
            }
            else {
                console.log("No courses found after filtering");
                return {
                    status: 400,
                    data: "No valid courses found",
                };
            }
        }
        catch (error) {
            console.error("Error in getDataToHome:", error);
            return {
                status: 500,
                data: "Internal server error",
            };
        }
    }
    // entrolledCourseData
    async enrolledCourseData(userId) {
        const existEnrolledUser = await this._userRepository.enrolledUserExist(userId);
        if (existEnrolledUser == null) {
            return {
                status: 200,
                data: "No courses you are enrolled in",
            };
        }
        const enrolledData = await Promise.all(existEnrolledUser.map(async (courseEnrolled) => {
            const getCourse = await this._userRepository.findCourseById(courseEnrolled.courseId);
            const thumbnailImgUrl = await this._S3Uploader.getSignedUrl(getCourse?.thambnail_Img);
            return {
                ...getCourse,
                thumbnailImgUrl,
            };
        }));
        return {
            status: 200,
            data: enrolledData,
        };
    }
    // getPreviousMsgs
    async getPreviousMsgs(senderId, receiverId) {
        const getInitialMsgs = await this._userRepository.getMsgs(senderId, receiverId);
        return {
            status: 200,
            data: getInitialMsgs,
        };
    }
    // getWalletData
    async getWalletData(userId) {
        const getWallet = await this._userRepository.walletDatas(userId);
        return {
            status: 200,
            getWallet,
        };
    }
    // successWalletPayment
    async successWalletPayment(userId, instructorId, courseId, price, courseName) {
        const paymentData = {
            userId: userId,
            courseId: courseId,
            instructorID: instructorId,
            price: price,
        };
        const walletPaymentSave = await this._userRepository.saveWalletPayment(paymentData);
        const walletUpdate = await this._userRepository.updateWallet(userId, price, courseName);
        if (walletPaymentSave && walletUpdate) {
            return {
                status: 200,
                message: "Payment successfully completed",
            };
        }
        else {
            return {
                status: 400,
                message: "Something went wrong in the payment,Please Check that",
            };
        }
    }
}
exports.default = UserUseCase;
