import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ReportIncidentModal } from './components/common/ReportIncidentModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AvailableFoodPage } from './pages/AvailableFoodPage';
import { DonationFormPage } from './pages/DonationFormPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';

// Dashboards
import { DonorDashboard } from './pages/dashboards/DonorDashboard';
import { NgoDashboard } from './pages/dashboards/NgoDashboard';
import { VolunteerDashboard } from './pages/dashboards/VolunteerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

function MainLayout() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDonationId, setReportDonationId] = useState<number | null>(null);
  const [reportDonationTitle, setReportDonationTitle] = useState<string | undefined>(undefined);

  const handleOpenReportModal = (donationId?: number, title?: string) => {
    setReportDonationId(donationId || null);
    setReportDonationTitle(title);
    setReportModalOpen(true);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render active page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onOpenReportModal={() => handleOpenReportModal()} />;
      case 'available-food':
        return <AvailableFoodPage onNavigate={handleNavigate} onOpenReportModal={handleOpenReportModal} />;
      case 'donate-food':
        return <DonationFormPage onNavigate={handleNavigate} />;
      case 'how-it-works':
        return <HowItWorksPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onOpenReportModal={() => handleOpenReportModal()} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;

      // Protected Role Dashboards
      case 'donor-dashboard':
        return <DonorDashboard onNavigate={handleNavigate} onOpenReportModal={handleOpenReportModal} />;
      case 'ngo-dashboard':
        return <NgoDashboard onNavigate={handleNavigate} onOpenReportModal={handleOpenReportModal} />;
      case 'volunteer-dashboard':
        return <VolunteerDashboard onNavigate={handleNavigate} onOpenReportModal={handleOpenReportModal} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={handleNavigate} onOpenReportModal={handleOpenReportModal} />;

      default:
        return <HomePage onNavigate={handleNavigate} onOpenReportModal={() => handleOpenReportModal()} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F6] text-[#182C25] font-sans antialiased selection:bg-[#B9E769]/50 selection:text-[#064E3B]">
      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenReportModal={() => handleOpenReportModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenReportModal={() => handleOpenReportModal()}
      />

      {/* Incident / Complaint Modal */}
      <ReportIncidentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        donationId={reportDonationId}
        donationTitle={reportDonationTitle}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
