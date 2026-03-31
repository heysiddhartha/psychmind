/**
 * Services Index - Export all service modules
 */

// Therapist Service
export {
    fetchTherapists,
    fetchTherapistById,
    fetchTherapistByProfileId,
    getTherapistAvailability,
    getBlockedTimes,
    getAvailableTimeSlots,
    getAvailableDates,
    updateAvailability,
    blockTime,
    getAllSpecialties,
    getAllLanguages,
    type TherapistProfile,
    type TherapistAvailability,
    type BlockedTime,
    type AvailableSlot
} from './therapistService';

// WebRTC Service
export {
    WebRTCService,
    createVideoSession,
    getVideoSession,
    getVideoSessionByRoom,
    type RTCConfig,
    type SignalMessage,
    type VideoSession
} from './webrtcService';

// Message Service
export {
    getOrCreateConversation,
    getUserConversations,
    sendMessage,
    getConversationMessages,
    markMessagesAsRead,
    deleteMessage,
    subscribeToConversation,
    sendTypingIndicator,
    subscribeToUserConversations,
    uploadMessageAttachment,
    formatMessageTime,
    isUserOnline,
    type ConversationWithParticipant,
    type MessageWithSender
} from './messageService';

// Payment Service
export {
    fetchSessionPackages,
    getPackageById,
    calculatePrice,
    formatPrice,
    createPaymentIntent,
    confirmPayment,
    getPaymentByBooking,
    getClientPayments,
    processRefund,
    generateInvoice,
    type SessionPackage,
    type PaymentRecord,
    type PricingCalculation,
    type Invoice
} from './paymentService';

// Assessment Service
export {
    fetchAssessments,
    getAssessmentBySlug,
    calculateScore,
    submitAssessment,
    getUserAssessments,
    getLatestResult,
    generatePDFReport,
    getSeverityColor,
    type Assessment,
    type AssessmentQuestion,
    type AssessmentSubmission,
    type AssessmentResult
} from './assessmentService';

// Form Service
export {
    fetchForms,
    getFormBySlug,
    submitForm,
    getUserSubmissions,
    checkRequiredForms,
    validateFormData,
    type FormSchema,
    type FormField,
    type FormSection,
    type FormSubmission
} from './formService';

// Default exports as namespaced objects
import * as therapistService from './therapistService';
import * as messageService from './messageService';
import * as paymentService from './paymentService';
import * as assessmentService from './assessmentService';
import * as formService from './formService';
import * as encryptionService from './encryptionService';
import * as edgeFunctionsClient from './edgeFunctionsClient';
import * as analyticsService from './analyticsService';
import * as notificationService from './notificationService';
import * as bookingRealtimeService from './bookingRealtimeService';

export {
    therapistService,
    messageService,
    paymentService,
    assessmentService,
    formService,
    encryptionService,
    edgeFunctionsClient,
    analyticsService,
    notificationService,
    bookingRealtimeService
};

// Encryption Service
export {
    generateConversationKey,
    exportKey,
    importKey,
    encryptMessage,
    decryptMessage,
    encryptChatMessage,
    decryptChatMessage,
    generateMasterKey,
    generateSalt,
    hashString,
    type EncryptedPayload,
    type KeyPair
} from './encryptionService';

// Edge Functions Client
export {
    sendBookingConfirmationEmail,
    sendBookingReminderEmail,
    sendBookingCancellationEmail,
    getTherapistRecommendations,
    requestPushPermission,
    showPushNotification,
    isPushEnabled,
    registerServiceWorker,
    type BookingEmailPayload,
    type TherapistMatchRequest,
    type TherapistMatch,
    type TherapistMatchResponse
} from './edgeFunctionsClient';

// Analytics Service
export {
    trackEvent,
    getUserStats,
    getPlatformStats,
    getTherapistStats,
    type AnalyticsEvent,
    type UserStats,
    type PlatformStats,
    type TherapistStats
} from './analyticsService';

// Notification Service
export {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    notifyBookingConfirmed,
    notifyNewMessage,
    notifyIncomingCall,
    notifyBookingReminder,
    notifyPaymentReceived,
    type NotificationType,
    type Notification,
    type CreateNotificationData
} from './notificationService';
