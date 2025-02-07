"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminController {
    constructor(adminUseCase) {
        this.adminUseCase = adminUseCase;
    }
    // taking all users for listing them
    async getUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 3;
            const userList = await this.adminUseCase.usersData(page, limit);
            return res.status(userList.status).json(userList.data);
        }
        catch (error) {
            next(error);
        }
    }
    // user block
    async blockUser(req, res, next) {
        try {
            const { userID } = req.body;
            console.log("blk conntroller", userID);
            const result = await this.adminUseCase.userBlock(userID);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // unblock user
    async unblockUser(req, res, next) {
        try {
            const { userID } = req.body;
            console.log("unblk", userID);
            const result = await this.adminUseCase.userUnblock(userID);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // taking all tutors for listing them
    async getTutors(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 3;
            const tutorsList = await this.adminUseCase.tutorsData(page, limit);
            return res.status(tutorsList.status).json(tutorsList.data);
        }
        catch (error) {
            next(error);
        }
    }
    // tutor block
    async blockTutor(req, res, next) {
        try {
            const { tutorID } = req.body;
            const result = await this.adminUseCase.tutorBlock(tutorID);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // unblock tutor
    async unblockTutor(req, res, next) {
        try {
            const { tutorID } = req.body;
            const result = await this.adminUseCase.tutorUnblock(tutorID);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // save category
    async saveCategory(req, res, next) {
        try {
            const { category } = req.body;
            const Category = { categoryName: category };
            const saveCategory = await this.adminUseCase.saveCategory(Category);
            if (saveCategory.status == 201) {
                return res.status(saveCategory.status).json(saveCategory.data);
            }
            else {
                return res
                    .status(saveCategory.status)
                    .json({ message: saveCategory.message });
            }
        }
        catch (error) {
            next(error);
        }
    }
    // taking all users for listing them
    async getCategories(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 3;
            const cateList = await this.adminUseCase.categoryData(page, limit);
            return res.status(cateList.status).json(cateList.data);
        }
        catch (error) {
            next(error);
        }
    }
    //category unlist
    async categoryUnlist(req, res, next) {
        try {
            const { categoryID } = req.body;
            const result = await this.adminUseCase.categoryUnlist(categoryID);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    //category list
    async categoryList(req, res, next) {
        try {
            const { categoryID } = req.body;
            const result = await this.adminUseCase.categoryList(categoryID);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    // category update
    async categoryEdit(req, res, next) {
        try {
            const { newCategory, categoryID } = req.body;
            const result = await this.adminUseCase.categoryUpdate(newCategory, categoryID);
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
    async getCourse(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const getAllCourses = await this.adminUseCase.allCourseGet(Number(limit), skip);
            if (getAllCourses) {
                const totalItems = await this.adminUseCase.countCourses();
                return res
                    .status(getAllCourses.status)
                    .json({ ...getAllCourses.data, totalItems });
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
            const courseViewData = await this.adminUseCase.getViewCourse(id);
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
    // getUnapprovedCourse
    async unapprovedCourse(req, res, next) {
        try {
            const getUnapprCourse = await this.adminUseCase.unapprovedCourses();
            if (getUnapprCourse) {
                return res.status(getUnapprCourse.status).json(getUnapprCourse.data);
            }
            else {
                return res.status(404).json({ message: "No course found" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async courseApproved(req, res, next) {
        try {
            const { course_id } = req.body;
            const result = await this.adminUseCase.courseVerify(course_id);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
            }
        }
        catch (error) {
            next(error);
        }
    }
    async courseUnapproved(req, res, next) {
        try {
            const { course_id } = req.body;
            const result = await this.adminUseCase.courseUnverify(course_id);
            if (result.status == 200) {
                return res.status(result.status).json(result.data.message);
            }
            else {
                return res.status(result.status).json(result.data.message);
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
            const getReview = await this.adminUseCase.reviewsFetch(courseId);
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
            const assignmentsData = await this.adminUseCase.getAssignments(courseId);
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
            const instructorData = await this.adminUseCase.getInstructorDetails(instructorId);
            return res.status(instructorData.status).json(instructorData.data);
        }
        catch (error) {
            next(error);
        }
    }
    // getReports
    async getReports(req, res, next) {
        try {
            const reports = await this.adminUseCase.fetchReports();
            if (!reports) {
                return res.status(404).json({ message: "No reports found" });
            }
            return res.status(reports.status).json(reports.data);
        }
        catch (error) {
            next(error);
        }
    }
    // deleteReportCourse
    async deleteReportCourse(req, res, next) {
        try {
            const { courseId, courseName, email, instructorName } = req.body;
            const result = await this.adminUseCase.deleteCourse(courseId, courseName, email, instructorName);
            return res.status(result.status).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // getRating
    async getRating(req, res, next) {
        try {
            const getRate = await this.adminUseCase.getRates();
            return res.status(getRate.status).json(getRate);
        }
        catch (error) {
            next(error);
        }
    }
    //getDashboardData
    async getDashboardData(req, res, next) {
        try {
            const getData = await this.adminUseCase.getDashboard();
            return res.status(getData.status).json(getData);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = AdminController;
