import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Users, 
  GraduationCap, 
  Calendar, 
  School, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Send,
  Award,
  Instagram
} from 'lucide-react';
import { CAREERS, GALLERY } from './constants';
import { AdminGallery } from './components/AdminGallery';
import { Lock, LogIn, LogOut, ShieldCheck } from 'lucide-react';

const profileImg = '/images/profile.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '홈', href: '#' },
    { name: '강사프로필', href: '#profile' },
    { name: '갤러리', href: '#gallery' },
    { name: '강의 문의', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Code2 className="text-white w-6 h-6" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            디지털 교육 전문가
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-lg font-medium text-slate-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>디지털 교육의 새로운 기준</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
            코딩, 공부가 아니라 <br />
            <span className="text-indigo-600">즐거운 놀이</span>가 됩니다.
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed mx-auto">
            어렵게만 느껴졌던 코딩, 아이들의 눈높이에서 즐겁게 풀어냅니다. <br />
            디지털새싹, SW미래채움 강사가 전하는 생생한 디지털 교육을 만나보세요.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.a 
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 md:w-28 md:h-28 bg-indigo-600 text-white rounded-full flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all border-2 border-white"
            >
              <Mail className="w-5 h-5 md:w-6 md:h-6 mb-1" />
              <span className="font-bold text-xs md:text-sm leading-tight">강의 문의</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Profile = () => {
  const groupedCareers: { period: string; items: typeof CAREERS }[] = [];
  CAREERS.forEach((career) => {
    const lastGroup = groupedCareers[groupedCareers.length - 1];
    if (lastGroup && lastGroup.period === career.period) {
      lastGroup.items.push(career);
    } else {
      groupedCareers.push({ period: career.period, items: [career] });
    }
  });

  return (
    <section id="profile" className="min-h-screen flex items-center py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">강사 프로필</h2>
          <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <div className="sticky top-32">
              <div className="rounded-3xl overflow-hidden shadow-lg mb-4 aspect-[3/4] bg-slate-200 flex items-center justify-center relative group border-4 border-white">
                {/* 
                  [사진 교체 방법]
                  1. 첨부해주신 사진을 'profile.png'라는 이름으로 저장합니다.
                  2. 이 프로젝트의 'src' 폴더에 해당 파일을 업로드합니다.
                  3. 아래 src의 URL 부분을 './profile.png' 로 수정하면 사진이 반영됩니다.
                */}
                <img 
                  src={profileImg} 
                  alt="디지털강사 이정인 프로필 사진" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">디지털강사 이정인</h3>
                <p className="text-indigo-600 font-bold text-lg">SW/AI 교육 전문가</p>
                <p className="text-slate-600 leading-relaxed text-sm">
                  "아이들이 코딩을 통해 스스로 무언가를 만들어내는 기쁨을 알게 되었을 때 가장 큰 보람을 느낍니다. 
                  단순한 기술 전달이 아닌, 창의적으로 생각하는 법을 가르칩니다."
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-600 w-5 h-5" /> 교육 철학
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '놀이 중심의 흥미 유발',
                    '자기주도적 문제 해결력',
                    '협업을 통한 팀워크 향상',
                    '실생활 연계 프로젝트'
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                      <span className="font-semibold text-slate-700 text-xs">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-8">
            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <GraduationCap className="text-indigo-600" /> 주요 경력
              </h4>
              <div className="space-y-3">
                {groupedCareers.map((group, idx) => {
                  const isCurrent = group.period.includes('현재');
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                        isCurrent 
                          ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                          : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex flex-col w-20 shrink-0">
                        <div className={`font-bold whitespace-nowrap pt-0.5 text-xs ${
                          isCurrent ? 'text-indigo-700' : 'text-indigo-600'
                        }`}>
                          {group.period}
                        </div>
                      </div>
                      <div className="space-y-3 flex-1">
                        {group.items.map((item, itemIdx) => (
                          <div key={itemIdx} className={`border-b last:border-0 pb-2 last:pb-0 ${
                            isCurrent ? 'border-indigo-100' : 'border-slate-200'
                          }`}>
                            <h5 className="font-bold text-slate-900 text-sm mb-0.5">{item.title}</h5>
                            <p className="text-slate-500 text-xs">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const years = ['2026년', '2025년', '2024년', '2023년', '2022년 이전'];
  const [selectedYear, setSelectedYear] = useState('2025년');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGalleryItems(data);
    } catch (err) {
      console.error('Failed to fetch gallery', err);
      // Fallback to static data if API fails
      setGalleryItems(GALLERY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Sort gallery by year descending (latest first)
  const sortedGallery = [...galleryItems].sort((a, b) => {
    const getYearValue = (yearStr: string) => {
      if (yearStr === '2022년 이전') return 2022;
      return parseInt(yearStr.replace('년', '')) || 0;
    };
    return getYearValue(b.year) - getYearValue(a.year);
  });

  const filteredGallery = sortedGallery.filter(item => item.year === selectedYear);

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
  };

  return (
    <section id="gallery" className="min-h-screen flex items-center py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">활동 갤러리</h2>
          <p className="text-slate-600 mb-8">아이들과 함께한 소중한 교육 현장의 기록입니다.</p>
          
          {/* Year Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-8 py-4 rounded-2xl text-lg md:text-xl font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedImage(item)}
                  className="relative flex flex-col rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-slate-100 bg-slate-50 p-2"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden group-hover:shadow-md transition-shadow">
                    {isVideo(item.image) ? (
                      <div className="w-full h-full relative">
                        <video 
                          src={item.image} 
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-3 px-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {item.year}
                      </span>
                    </div>
                    <p className="text-slate-800 font-bold text-xs md:text-sm line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {!loading && filteredGallery.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            해당 연도의 활동 사진이 아직 없습니다.
          </div>
        )}

        {/* Admin Section - Removed from main flow */}
        
        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-indigo-400 transition-colors p-2"
                >
                  <X size={32} />
                </button>
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                  {isVideo(selectedImage.image) ? (
                    <video 
                      src={selectedImage.image} 
                      controls 
                      autoPlay
                      className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                    />
                  ) : (
                    <img 
                      src={selectedImage.image} 
                      alt={selectedImage.title} 
                      className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                    />
                  )}
                  <div className="bg-white p-6 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                        {selectedImage.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedImage.title}</h3>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="min-h-screen flex items-center py-24 bg-indigo-600 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            특별한 디지털 수업을 <br />
            시작해보세요.
          </h2>
          <p className="text-indigo-100 text-lg mb-12 leading-relaxed">
            교육이 필요한 곳이라면 어디든 달려갑니다. <br />
            아래 연락처로 문의해 주시면 친절히 상담해 드립니다.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.a 
              href="tel:010-9357-6947"
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
            >
              <div className="bg-white/20 p-4 rounded-2xl mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-indigo-200 font-bold uppercase tracking-wider mb-1">연락처</p>
              <p className="text-xl font-bold text-white">010-9357-6947</p>
            </motion.a>

            <motion.a 
              href="mailto:arare_80@naver.com"
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
            >
              <div className="bg-white/20 p-4 rounded-2xl mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-indigo-200 font-bold uppercase tracking-wider mb-1">이메일</p>
              <p className="text-xl font-bold text-white">arare_80@naver.com</p>
            </motion.a>

            <motion.a 
              href="https://www.instagram.com/junginlee_80/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 flex flex-col items-center text-center hover:bg-white/20 transition-colors"
            >
              <div className="bg-white/20 p-4 rounded-2xl mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-indigo-200 font-bold uppercase tracking-wider mb-1">인스타</p>
              <p className="text-xl font-bold text-white">@junginlee_80</p>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onUpdate }: { onUpdate: () => void }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        setError('');
        setPassword('');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <footer className="bg-slate-900 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800 pb-12 mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Code2 className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              디지털 교육 전문가
            </span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8 text-sm font-medium">
              <a href="#profile" className="hover:text-white transition-colors">강사프로필</a>
              <a href="#gallery" className="hover:text-white transition-colors">갤러리</a>
              <a href="#contact" className="hover:text-white transition-colors">문의</a>
            </div>
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-indigo-400 transition-colors mt-2 bg-slate-800/30 px-3 py-1 rounded-full border border-slate-800"
            >
              <Lock size={10} /> 관리자 모드
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2024 디지털 교육 전문가. All rights reserved.</p>
          <p>본 홈페이지는 교육 홍보를 목적으로 제작되었습니다.</p>
        </div>
      </div>

      {/* Admin Modal Overlay */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="p-8 md:p-12">
                {!isLoggedIn ? (
                  <div className="max-w-md mx-auto py-12">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-indigo-600 w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">관리자 로그인</h3>
                      <p className="text-slate-500 mt-2">갤러리 관리를 위해 비밀번호를 입력해주세요.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호 입력"
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                          autoFocus
                        />
                        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        <LogIn size={20} /> 로그인
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="text-green-600 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">관리자 세션 활성화됨</h3>
                      </div>
                      <button 
                        onClick={() => setIsLoggedIn(false)}
                        className="flex items-center gap-2 text-sm text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                      >
                        <LogOut size={16} /> 로그아웃
                      </button>
                    </div>
                    
                    <AdminGallery onUpdate={onUpdate} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default function App() {
  const [galleryUpdateTrigger, setGalleryUpdateTrigger] = useState(0);

  const triggerGalleryUpdate = () => {
    setGalleryUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <Hero />
        <Profile />
        <Gallery key={galleryUpdateTrigger} />
        <Contact />
      </main>
      <Footer onUpdate={triggerGalleryUpdate} />
    </div>
  );
}
