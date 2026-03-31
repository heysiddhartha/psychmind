import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

// Critical pages loaded eagerly (landing + auth)
import Home from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Lazy-loaded pages (code-split into separate chunks)
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Team = lazy(() => import("./pages/Team"));
const FAQs = lazy(() => import("./pages/FAQs"));
const ForClients = lazy(() => import("./pages/ForClients"));
const Contact = lazy(() => import("./pages/Contact"));
const Specialities = lazy(() => import("./pages/Specialities"));
const JoinTeam = lazy(() => import("./pages/JoinTeam"));
const Assessments = lazy(() => import("./pages/Assessments"));
const DownloadableGuides = lazy(() => import("./pages/DownloadableGuides"));
const AssessmentResults = lazy(() => import("./pages/AssessmentResults"));
const PHQ9Questionnaire = lazy(() => import("./pages/PHQ9Questionnaire"));
const GAD7Questionnaire = lazy(() => import("./pages/GAD7Questionnaire"));
const PSSQuestionnaire = lazy(() => import("./pages/PSSQuestionnaire"));
const PTSDQuestionnaire = lazy(() => import("./pages/PTSDQuestionnaire"));
const DASTQuestionnaire = lazy(() => import("./pages/DASTQuestionnaire"));
const SCOFFQuestionnaire = lazy(() => import("./pages/SCOFFQuestionnaire"));
const BFIQuestionnaire = lazy(() => import("./pages/BFIQuestionnaire"));
const Topics = lazy(() => import("./pages/Topics"));
const TopicDetail = lazy(() => import("./pages/TopicDetail"));
const OurStory = lazy(() => import("./pages/OurStory"));
const CounsellingTypes = lazy(() => import("./pages/CounsellingTypes"));
const CounsellingModes = lazy(() => import("./pages/CounsellingModes"));
const SupervisionTherapists = lazy(() => import("./pages/SupervisionTherapists"));
const SupportBusinesses = lazy(() => import("./pages/SupportBusinesses"));
const SupportSchools = lazy(() => import("./pages/SupportSchools"));
const SupportWorkshops = lazy(() => import("./pages/SupportWorkshops"));

// Dashboard Pages
const PatientDashboard = lazy(() => import("./pages/dashboard/PatientDashboard"));
const TherapistDashboard = lazy(() => import("./pages/dashboard/TherapistDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboard/SuperAdminDashboard"));
const SuperAdminLogin = lazy(() => import("./pages/SuperAdminLogin"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));

// Booking
const BookingPage = lazy(() => import("./pages/BookingPage"));

// Blogs
const BlogsPage = lazy(() => import("./pages/BlogsPage"));

// Video Call
const VideoCallRoom = lazy(() => import("./pages/VideoCallRoom"));

// Messages
const MessagesPage = lazy(() => import("./pages/MessagesPage"));

// Other Pages
const EBooks = lazy(() => import("./pages/EBooks"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopAdmin = lazy(() => import("./pages/ShopAdmin"));
const Stories = lazy(() => import("./pages/Stories"));
const IntakeForm = lazy(() => import("./pages/IntakeForm"));
const AssessmentTake = lazy(() => import("./pages/AssessmentTake"));
const TherapistProfile = lazy(() => import("./pages/TherapistProfile"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SessionNotes = lazy(() => import("./pages/SessionNotes"));
const MyPatients = lazy(() => import("./pages/MyPatients"));
const BookingManagement = lazy(() => import("./pages/BookingManagement"));
const FindTherapist = lazy(() => import("./pages/FindTherapist"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000,   // 10 min garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessment-results" element={<AssessmentResults />} />
                <Route path="/phq-9-questionnaire" element={<PHQ9Questionnaire />} />
                <Route path="/gad-7-questionnaire" element={<GAD7Questionnaire />} />
                <Route path="/pss-questionnaire" element={<PSSQuestionnaire />} />
                <Route path="/ptsd-questionnaire" element={<PTSDQuestionnaire />} />
                <Route path="/dast-questionnaire" element={<DASTQuestionnaire />} />
                <Route path="/scoff-questionnaire" element={<SCOFFQuestionnaire />} />
                <Route path="/bfi-questionnaire" element={<BFIQuestionnaire />} />
                <Route path="/services" element={<Services />} />
                <Route path="/specialities" element={<Specialities />} />
                <Route path="/counselling-types" element={<CounsellingTypes />} />
                <Route path="/counselling-modes" element={<CounsellingModes />} />
                <Route path="/team" element={<Team />} />
                <Route path="/find-therapist" element={<FindTherapist />} />
                <Route path="/therapist/:id" element={<TherapistProfile />} />
                <Route path="/join-team" element={<JoinTeam />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/guides" element={<DownloadableGuides />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/topics/:slug" element={<TopicDetail />} />
                <Route path="/for-clients" element={<ForClients />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/supervision-therapists" element={<SupervisionTherapists />} />
                <Route path="/support-businesses" element={<SupportBusinesses />} />
                <Route path="/support-schools" element={<SupportSchools />} />
                <Route path="/support-workshops" element={<SupportWorkshops />} />
                <Route path="/blogs/*" element={<BlogsPage />} />
                <Route path="/ebooks" element={<EBooks />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop-admin" element={<ShopAdmin />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/intake-form" element={<IntakeForm />} />
                <Route path="/assessments/:slug" element={<AssessmentTake />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />

                {/* Protected Routes - Dashboards */}
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/dashboard/patient" element={<PatientDashboard />} />
                <Route path="/dashboard/therapist" element={<TherapistDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/super-admin" element={<SuperAdminLogin />} />
                <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />

                {/* Booking */}
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/booking/:therapistId" element={<BookingPage />} />

                {/* Communication */}
                <Route path="/call/:roomId" element={<VideoCallRoom />} />
                <Route path="/video-call/:roomId" element={<VideoCallRoom />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:conversationId" element={<MessagesPage />} />

                {/* Therapist Pages */}
                <Route path="/notes" element={<SessionNotes />} />
                <Route path="/patients" element={<MyPatients />} />
                <Route path="/bookings-management" element={<BookingManagement />} />
                <Route path="/booking-management" element={<BookingManagement />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
