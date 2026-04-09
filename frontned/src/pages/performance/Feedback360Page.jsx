import React, { useState, useEffect } from 'react';
import {
    Users,
    MessageSquare,
    ChevronRight,
    ThumbsUp,
    Zap,
    Edit3,
    CheckCircle2,
    Clock,
    Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import performanceService from '../../services/performanceService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const Feedback360Page = () => {
    const { t } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [formData, setFormData] = useState({
        rating: 5,
        strengths: '',
        areas_for_improvement: '',
        general_comments: ''
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // In a real system, we'd have an endpoint to get reviews assigned to me
            // Using summary as a placeholder or assuming the user has some assigned
            const res = await performanceService.getEmployeeSummary(user.id);
            // Filtering logic normally happens on backend
            setMyRequests(res.data.reviews || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            await performanceService.submitFeedback(selectedReview.id, formData);
            toast.success(t('feedbackSubmittedSuccessfully'));
            setSelectedReview(null);
            fetchReviews();
        } catch (error) {
            toast.error(t('failedToSubmitFeedback'));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('360DegreeFeedback')}</h1>
                <p className="text-gray-500 mt-2 text-lg">{t('helpingEachOtherGrow')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Pending Requests */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="text-orange-500" size={20} />
                            {t('pendingReviews')}
                        </h2>
                        <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full">{myRequests.length}</span>
                    </div>

                    {myRequests.length === 0 ? (
                        <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 size={48} className="text-green-200 mb-4" />
                            <h3 className="text-gray-900 font-bold">{t('allCaughtUp')}</h3>
                            <p className="text-gray-400 text-sm mt-1">{t('noPendingFeedbackRequests')}</p>
                        </div>
                    ) : (
                        myRequests.map(review => (
                            <div
                                key={review.id}
                                onClick={() => setSelectedReview(review)}
                                className={`group p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${selectedReview?.id === review.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'bg-white border-gray-50 text-gray-900 hover:border-indigo-100 hover:bg-indigo-50/30 shadow-lg shadow-gray-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${selectedReview?.id === review.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {review.Employee?.User?.first_name?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{review.Employee?.User?.first_name} {review.Employee?.User?.last_name}</h4>
                                        <p className={`text-xs ${selectedReview?.id === review.id ? 'text-indigo-100' : 'text-gray-400 font-medium'}`}>{review.type.toUpperCase()} REVIEW • {review.period_name}</p>
                                    </div>
                                </div>
                                <ChevronRight size={24} className={selectedReview?.id === review.id ? 'opacity-100 translate-x-1 transition-transform' : 'text-gray-200'} />
                            </div>
                        ))
                    )}
                </div>

                {/* Form Area */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 p-10 min-h-[500px] flex flex-col">
                    {!selectedReview ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <div className="p-8 bg-gray-50 rounded-full">
                                <Edit3 size={64} className="text-gray-300" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{t('nothingSelected')}</h3>
                                <p className="text-gray-400 max-w-[250px] mx-auto">{t('chooseAReviewFromTheList')}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitFeedback} className="space-y-8 h-full flex flex-col animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{t('givingFeedbackTo')}</h3>
                                    <p className="text-indigo-600 font-black flex items-center gap-1">
                                        <Users size={16} />
                                        {selectedReview.Employee?.User?.first_name} {selectedReview.Employee?.User?.last_name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">{selectedReview.type}</span>
                                </div>
                            </div>

                            <div className="space-y-6 flex-grow">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-4">{t('overallRating')}</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating })}
                                                className={`flex-grow py-3 rounded-xl font-black transition-all ${formData.rating >= rating ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <ThumbsUp size={16} className="text-green-500" />
                                            {t('coreStrengths')}
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                            placeholder={t('whatDoTheyDoExceptionallyWell?')}
                                            value={formData.strengths}
                                            onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Zap size={16} className="text-orange-500" />
                                            {t('growthAreas')}
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                            placeholder={t('howCanTheyImprove?')}
                                            value={formData.areas_for_improvement}
                                            onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <MessageSquare size={16} className="text-indigo-500" />
                                        {t('additionalComments')}
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                        placeholder={t('anyOtherThoughts?')}
                                        value={formData.general_comments}
                                        onChange={(e) => setFormData({ ...formData, general_comments: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                {t('submitProfessionalReview')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Feedback360Page;
