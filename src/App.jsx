import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './views/Home';
import ImageToPdf from './views/scanner/ImageToPdf';
import MergePdf from './views/pdf/MergePdf';
import TextToPdf from './views/pdf/TextToPdf';
import SplitPdf from './views/pdf/SplitPdf';
import CompressPdf from './views/pdf/CompressPdf';
import LockPdf from './views/pdf/LockPdf';
import UnlockPdf from './views/pdf/UnlockPdf';
import CreatePdf from './views/pdf/CreatePdf';
import EditPdf from './views/pdf/EditPdf';
import WordToPdf from './views/pdf/WordToPdf';
import PptToPdf from './views/pdf/PptToPdf';
import ExcelToPdf from './views/pdf/ExcelToPdf';
import PdfToImage from './views/pdf/PdfToImage';
import PdfToWord from './views/pdf/PdfToWord';
import PdfToPpt from './views/pdf/PdfToPpt';
import PdfToExcel from './views/pdf/PdfToExcel';
import CompressImage from './views/image/CompressImage';
import ConvertImage from './views/image/ConvertImage';
import ResizeImage from './views/image/ResizeImage';
import ImageToWord from './views/image/ImageToWord';
import CreateWord from './views/word/CreateWord';
import EditWord from './views/word/EditWord';
import CompressWord from './views/word/CompressWord';
import WordToPpt from './views/word/WordToPpt';
import WordToExcel from './views/word/WordToExcel';
import CreateExcel from './views/excel/CreateExcel';
import EditExcel from './views/excel/EditExcel';
import CompressExcel from './views/excel/CompressExcel';
import ExcelToWord from './views/excel/ExcelToWord';
import CreatePpt from './views/ppt/CreatePpt';
import EditPpt from './views/ppt/EditPpt';
import CompressPpt from './views/ppt/CompressPpt';
import PptToWord from './views/ppt/PptToWord';
import PptToImage from './views/ppt/PptToImage';
import ScanPage from './views/scan/ScanPage';
import Blog from './views/Blog';
import About from './views/About';
import AdminPortal from './views/AdminPortal';
import ToolPlaceholder from './components/ToolPlaceholder';
import { getAllTools } from './config/toolsConfig';
import { Globe, Search, Home as HomeIcon, Download } from 'lucide-react';

function TitleUpdater({ tools }) {
  const location = useLocation();
  useEffect(() => {
    const tool = tools.find(t => t.to === location.pathname);
    document.title = tool ? `${tool.title} | DocTools` : 'DocTools - Document Toolkit';
  }, [location, tools]);
  return null;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function App() {
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const tools = getAllTools();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    
    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    fetch('/api/admin/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.current) setAnnouncement(data.current);
      })
      .catch(err => console.log('No announcements'));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };
  
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ur' : 'en');

  const implementedPaths = [
    '/scanner/image-to-pdf', '/pdf/merge', '/pdf/text-to-pdf', '/pdf/split', '/pdf/compress', '/pdf/lock', '/pdf/unlock', '/pdf/create', '/pdf/edit',
    '/pdf/word-to-pdf', '/pdf/ppt-to-pdf', '/pdf/excel-to-pdf', '/pdf/to-image', '/pdf/to-word', '/pdf/to-ppt', '/pdf/to-excel',
    '/image/compress', '/image/convert', '/image/resize', '/image/ocr',
    '/word/create', '/word/edit', '/word/compress', '/word/to-ppt', '/word/to-excel',
    '/excel/create', '/excel/edit', '/excel/compress', '/excel/to-word',
    '/ppt/create', '/ppt/edit', '/ppt/compress', '/ppt/to-word', '/ppt/to-image',
    '/scan/camera', '/scan/gallery', '/scan/enhance', '/scan/ocr',
  ];

  return (
    <Router>
      <ScrollToTop />
      <TitleUpdater tools={tools} />
      <div className={`app ${lang === 'ur' ? 'rtl' : ''}`}>
        <header className="header">
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', padding: '10px 0' }}>
              <Link to="/" className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ 
                position: 'fixed', top: '20px', left: '20px', zIndex: 100,
                display: 'flex', alignItems: 'center', gap: isScrolled ? '0' : '0.75rem', 
                padding: isScrolled ? '0.75rem' : '0.75rem 1.5rem', 
                fontSize: '1.1rem', borderRadius: isScrolled ? '50%' : '1rem', 
                background: isScrolled ? 'var(--primary)' : 'rgba(99, 102, 241, 0.9)', 
                border: '1px solid var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
              }}>
                <HomeIcon size={24} />
                {!isScrolled && <span style={{ fontWeight: 'bold' }}>HOME</span>}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/" className="logo-container" onClick={() => setMenuOpen(false)}>
                  <img src="/doctools_icon.png" alt="DocTools Logo" className="logo-img" style={{ width: '50px', height: '50px' }} />
                  <span className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>DocTools</span>
                </Link>
                <button className="btn btn-secondary hide-mobile" onClick={toggleLang} style={{ padding: '0.6rem 1.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                   {lang === 'en' ? 'UR' : 'EN'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'absolute', right: '0' }}>
                {deferredPrompt && (
                  <button onClick={handleInstallClick} className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                    <Download size={16} /> <span className="hide-mobile">Install App</span>
                  </button>
                )}
                <button className="btn btn-secondary mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{ padding: '0.5rem' }}>
                  <div style={{ width: '20px', height: '2px', background: 'white', marginBottom: '4px' }} />
                  <div style={{ width: '20px', height: '2px', background: 'white', marginBottom: '4px' }} />
                  <div style={{ width: '20px', height: '2px', background: 'white' }} />
                </button>
              </div>
            </div>

            <nav className={`main-nav ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', transition: 'all 0.3s' }}>
              {[
                { id: 'pdf', label: "PDF Tools", to: "/#pdf-tools" },
                { id: 'word', label: "Word Tools", to: "/#word-tools" },
                { id: 'excel', label: "Excel Tools", to: "/#excel-tools" },
                { id: 'ppt', label: "PPT Tools", to: "/#ppt-tools" },
                { to: "/#image-tools", label: "Image" },
                { to: "/scan/camera", label: "Scan" },
                { to: "/blog", label: "Blog" },
                { to: "/about", label: "About" }
              ].map(link => (
                <Link key={link.to} to={link.to} className="btn btn-secondary nav-link" onClick={() => setMenuOpen(false)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>{link.label}</Link>
              ))}
            </nav>
          </div>
        </header>

        {announcement && (
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
            🔔 {announcement}
          </div>
        )}

        <main className="main-content" style={{ minHeight: 'calc(100vh - 180px)', padding: '2rem 0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminPortal />} />

            {/* PDF Tools */}
            <Route path="/scanner/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/pdf/merge" element={<MergePdf />} />
            <Route path="/pdf/text-to-pdf" element={<TextToPdf />} />
            <Route path="/pdf/split" element={<SplitPdf />} />
            <Route path="/pdf/compress" element={<CompressPdf />} />
            <Route path="/pdf/lock" element={<LockPdf />} />
            <Route path="/pdf/unlock" element={<UnlockPdf />} />
            <Route path="/pdf/create" element={<CreatePdf />} />
            <Route path="/pdf/edit" element={<EditPdf />} />
            <Route path="/pdf/word-to-pdf" element={<WordToPdf />} />
            <Route path="/pdf/ppt-to-pdf" element={<PptToPdf />} />
            <Route path="/pdf/excel-to-pdf" element={<ExcelToPdf />} />
            <Route path="/pdf/to-image" element={<PdfToImage />} />
            <Route path="/pdf/to-word" element={<PdfToWord />} />
            <Route path="/pdf/to-ppt" element={<PdfToPpt />} />
            <Route path="/pdf/to-excel" element={<PdfToExcel />} />

            {/* Image Tools */}
            <Route path="/image/compress" element={<CompressImage />} />
            <Route path="/image/convert" element={<ConvertImage />} />
            <Route path="/image/resize" element={<ResizeImage />} />
            <Route path="/image/ocr" element={<ImageToWord />} />

            {/* Word Tools */}
            <Route path="/word/create" element={<CreateWord />} />
            <Route path="/word/edit" element={<EditWord />} />
            <Route path="/word/compress" element={<CompressWord />} />
            <Route path="/word/to-ppt" element={<WordToPpt />} />
            <Route path="/word/to-excel" element={<WordToExcel />} />

            {/* Excel Tools */}
            <Route path="/excel/create" element={<CreateExcel />} />
            <Route path="/excel/edit" element={<EditExcel />} />
            <Route path="/excel/compress" element={<CompressExcel />} />
            <Route path="/excel/to-word" element={<ExcelToWord />} />

            {/* PPT Tools */}
            <Route path="/ppt/create" element={<CreatePpt />} />
            <Route path="/ppt/edit" element={<EditPpt />} />

            <Route path="/ppt/compress" element={<CompressPpt />} />
            <Route path="/ppt/to-word" element={<PptToWord />} />
            <Route path="/ppt/to-image" element={<PptToImage />} />

            {/* Scan Tools */}
            <Route path="/scan/camera" element={<ScanPage />} />
            <Route path="/scan/gallery" element={<ScanPage />} />
            <Route path="/scan/enhance" element={<ScanPage />} />
            <Route path="/scan/ocr" element={<ScanPage />} />

            {/* Remaining tools — placeholder */}
            {tools.filter(tool => !implementedPaths.includes(tool.to)).map(tool => (
              <Route key={tool.id} path={tool.to} element={<ToolPlaceholder />} />
            ))}
          </Routes>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} DocTools. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
