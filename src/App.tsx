import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "./components/SiteLayout";
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminServices from "./pages/admin/AdminServices";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminPhotos from "./pages/admin/AdminPhotos";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import BookNow from "./pages/BookNow.tsx";
import NotFound from "./pages/NotFound.tsx";
import { WhatsAppFab } from "./components/WhatsAppFab";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/book" element={<BookNow />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="photos" element={<AdminPhotos />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
          </Route>
        </Routes>
        <WhatsAppFab />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
