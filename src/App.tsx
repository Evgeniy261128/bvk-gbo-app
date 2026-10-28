import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomBar from './components/BottomBar';
import Home from './pages/Home';
import Price from './pages/Price';
import Booking from './pages/Booking';
import ReviewsChat from './pages/ReviewsChat';
import { ServiceType, TabType } from './types';

const App: React.FC = () => {
  const [activeService, setActiveService] = useState<ServiceType>('bvo');
  const [activeTab, setActiveTab] = useState<TabType>('home');

  useEffect(() => {
    document.body.setAttribute('data-theme', activeService);
  }, [activeService]);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home activeService={activeService} onTabChange={setActiveTab} />;
      case 'price':
        return <Price activeService={activeService} />;
      case 'booking':
        return <Booking activeService={activeService} />;
      case 'reviews':
        return <ReviewsChat activeService={activeService} />;
      default:
        return <Home activeService={activeService} onTabChange={setActiveTab} />;
    }
  };

  return (
    // Mobile Container: centers app on desktop like a phone screen
    <div className="min-h-screen bg-[#121316] flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-[#121316] text-white shadow-2xl pb-20">
        <div className="flex flex-col min-h-screen">
          <Header
            activeService={activeService}
            onServiceChange={setActiveService}
          />
          <div className="flex-1 overflow-y-auto pb-20">{renderPage()}</div>
          <BottomBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

export default App;
