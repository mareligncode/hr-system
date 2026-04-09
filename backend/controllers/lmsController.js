import { Course, CourseProgress, QuizQuestion, QuizAttempt, Employee, User, Department } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

// --- Course Management ---

export const getCourses = async (req, res) => {
    try {
        const { category, department_id } = req.query;
        let where = { is_active: true };
        if (category) where.category = category;
        if (department_id) where.department_id = department_id;

        const courses = await Course.findAll({
            where,
            include: [
                { model: Department, attributes: ['name'] },
                {
                    model: CourseProgress,
                    where: { employee_id: req.user.id },
                    required: false
                }
            ]
        });
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const getCourseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id, {
            include: [
                { model: QuizQuestion },
                { model: CourseProgress, where: { employee_id: req.user.id }, required: false }
            ]
        });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch course detail' });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { id } = req.params; // course_id
        const { percent_complete, status } = req.body;

        let [progress, created] = await CourseProgress.findOrCreate({
            where: { employee_id: req.user.id, course_id: id },
            defaults: { status: 'in_progress', percent_complete: 0 }
        });

        const updates = { percent_complete };
        if (status) updates.status = status;
        if (status === 'completed') updates.completed_at = new Date();

        await progress.update(updates);

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
};

// --- Quiz System ---

export const submitQuiz = async (req, res) => {
    try {
        const { id } = req.params; // course_id
        const { answers } = req.body; // Array of selected options

        const questions = await QuizQuestion.findAll({ where: { course_id: id } });
        if (questions.length === 0) return res.status(400).json({ error: 'No quiz for this course' });

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct_option_index) {
                correctCount++;
            }
        });

        const score = (correctCount / questions.length) * 100;
        const passed = score >= 70; // 70% passing threshold

        const attempt = await QuizAttempt.create({
            employee_id: req.user.id,
            course_id: id,
            score,
            passed
        });

        if (passed) {
            // Auto-complete course progress
            await CourseProgress.upsert({
                employee_id: req.user.id,
                course_id: id,
                status: 'completed',
                percent_complete: 100,
                completed_at: new Date()
            });
        }

        res.status(201).json({ attempt, score, passed, correctCount, total: questions.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
};

// --- Admin: Create Course ---

export const createCourse = async (req, res) => {
    try {
        const course = await Course.create({ ...req.body, created_by: req.user.id });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const addQuizQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const questions = req.body.map(q => ({ ...q, course_id: id }));
        await QuizQuestion.bulkCreate(questions);
        res.status(201).json({ message: 'Questions added' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
