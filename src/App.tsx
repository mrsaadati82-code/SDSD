import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Maximize,
  DollarSign,
  Clock,
  UserCheck,
  Users,
  TrendingUp,
  Shield,
  Lightbulb,
  LogOut,
  Heart,
  AlertTriangle,
  Key,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Info,
  FileText,
  AlertCircle,
  Check,
  Menu,
  X,
  Sparkles,
  User,
  Building2,
  ExternalLink
} from 'lucide-react';

import { categoriesData, PARTNERS, COMPANIES, Question, Category } from './questionsData';

// Map icon name to Lucide Icon Component
const iconMap: { [key: string]: any } = {
  Compass,
  Maximize,
  DollarSign,
  Clock,
  UserCheck,
  Users,
  TrendingUp,
  Shield,
  Lightbulb,
  LogOut,
  Heart,
  AlertTriangle,
  Key
};

interface Answer {
  text: string;
  selectedOption?: string;
}

interface QuestionAnswer {
  consensus?: Answer;
  individual?: {
    amir: Answer;
    ali: Answer;
    abolfazl: Answer;
  };
  company?: {
    startup: Answer;
    arasb: Answer;
  };
}

interface AnswersState {
  [questionId: string]: QuestionAnswer;
}

const LOCAL_STORAGE_KEY = 'arasb_startup_contract_answers';

export default function App() {
  // State for answers
  const [answers, setAnswers] = useState<AnswersState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved answers', e);
      }
    }
    return {};
  });

  // Navigation and UI states
  const [activeCategoryId, setActiveCategoryId] = useState<number>(1);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Tabs for individual & company questions
  // Stores the currently selected partner/company ID for each question ID to avoid tab sync issues
  const [activeTabs, setActiveTabs] = useState<{ [questionId: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const activeCategory = categoriesData.find(c => c.id === activeCategoryId) || categoriesData[0];

  // Initialize tabs for the current category if not set
  useEffect(() => {
    const newTabs = { ...activeTabs };
    let changed = false;
    activeCategory.questions.forEach(q => {
      if (q.type === 'individual' && !newTabs[q.id]) {
        newTabs[q.id] = 'amir'; // Default to Amirhossein
        changed = true;
      } else if (q.type === 'company' && !newTabs[q.id]) {
        newTabs[q.id] = 'startup'; // Default to Startup Company
        changed = true;
      }
    });
    if (changed) {
      setActiveTabs(newTabs);
    }
  }, [activeCategory]);

  // Helper to check if a question is fully answered
  const isQuestionAnswered = (q: Question): { answered: boolean; details: string } => {
    const ans = answers[q.id];
    if (!ans) return { answered: false, details: 'پاسخ داده نشده' };

    if (q.type === 'consensus') {
      const hasValue = !!ans.consensus?.text?.trim();
      return {
        answered: hasValue,
        details: hasValue ? 'کامل شده' : 'پاسخ داده نشده'
      };
    }

    if (q.type === 'individual') {
      const amirVal = ans.individual?.amir?.text?.trim();
      const aliVal = ans.individual?.ali?.text?.trim();
      const abolfazlVal = ans.individual?.abolfazl?.text?.trim();
      
      const count = [amirVal, aliVal, abolfazlVal].filter(Boolean).length;
      return {
        answered: count === 3,
        details: `${count} از ۳ نفر`
      };
    }

    if (q.type === 'company') {
      const startupVal = ans.company?.startup?.text?.trim();
      const arasbVal = ans.company?.arasb?.text?.trim();

      const count = [startupVal, arasbVal].filter(Boolean).length;
      return {
        answered: count === 2,
        details: `${count} از ۲ شرکت`
      };
    }

    return { answered: false, details: 'پاسخ داده نشده' };
  };

  // Calculate stats for a category
  const getCategoryStats = (cat: Category) => {
    const total = cat.questions.length;
    let answeredCount = 0;
    
    cat.questions.forEach(q => {
      if (isQuestionAnswered(q).answered) {
        answeredCount++;
      }
    });

    const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
    return { total, answeredCount, percent };
  };

  // Calculate overall stats
  const getOverallStats = () => {
    let totalQuestions = 0;
    let totalAnswered = 0;

    categoriesData.forEach(cat => {
      cat.questions.forEach(q => {
        totalQuestions++;
        if (isQuestionAnswered(q).answered) {
          totalAnswered++;
        }
      });
    });

    const percent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
    return { totalQuestions, totalAnswered, percent };
  };

  // Update answer handlers
  const handleConsensusAnswerChange = (questionId: string, text: string, selectedOption?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        consensus: { text, selectedOption }
      }
    }));
  };

  const handleIndividualAnswerChange = (questionId: string, partnerId: 'amir' | 'ali' | 'abolfazl', text: string, selectedOption?: string) => {
    setAnswers(prev => {
      const existing = prev[questionId] || {};
      const individual = existing.individual || {
        amir: { text: '' },
        ali: { text: '' },
        abolfazl: { text: '' }
      };
      
      return {
        ...prev,
        [questionId]: {
          ...existing,
          individual: {
            ...individual,
            [partnerId]: { text, selectedOption }
          }
        }
      };
    });
  };

  const handleCompanyAnswerChange = (questionId: string, companyId: 'startup' | 'arasb', text: string, selectedOption?: string) => {
    setAnswers(prev => {
      const existing = prev[questionId] || {};
      const company = existing.company || {
        startup: { text: '' },
        arasb: { text: '' }
      };

      return {
        ...prev,
        [questionId]: {
          ...existing,
          company: {
            ...company,
            [companyId]: { text, selectedOption }
          }
        }
      };
    });
  };

  const handleClearAnswer = (questionId: string) => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  // Reset all answers
  const handleResetAll = () => {
    setAnswers({});
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowResetConfirm(false);
    setActiveCategoryId(1);
    setShowWelcome(true);
  };

  // Export JSON file
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(answers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arasb-startup-contract-answers.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setAnswers(parsed);
        setShowImportModal(false);
        alert('اطلاعات با موفقیت بازیابی شد!');
      } catch (err) {
        alert('خطا در خواندن فایل. لطفاً مطمئن شوید فایل انتخابی یک فایل پشتیبان معتبر است.');
      }
    };
    reader.readAsText(file);
  };

  // Generate the formatted AI prompt
  const generateAIPrompt = () => {
    let text = `### پرومپت تخصصی تنظیم قرارداد شراکت و توافق‌نامه سهامداران\n\n`;
    text += `ما سه شریک تجاری هستیم که قصد داریم یک کسب‌وکار مشترک بزرگ را با هم‌افزایی توانایی‌هایمان آغاز کنیم. \n`;
    text += `ما دور یک میز نشسته‌ایم و به ۱۳ دسته از بحرانی‌ترین و اساسی‌ترین سوالات شراکت که برای پیشگیری از هرگونه اختلاف سلیقه و تضاد منافع در آینده طراحی شده است، پاسخ داده‌ایم.\n\n`;
    
    text += `**مشخصات شرکا:**\n`;
    text += `۱. امیرحسین (نقش فنی و استارتاپی - توسعه‌دهنده پلتفرم‌ها)\n`;
    text += `۲. علی (نقش مدیریت محصول، طراحی تجربه کاربری و بازاریابی استارتاپ‌ها)\n`;
    text += `۳. ابوالفضل (نقش تجاری، سرمایه‌گذار و مالک شرکت بازرگانی آراسب فعال در صادرات و واردات)\n\n`;

    text += `**شرکت‌ها و موضوع فعالیت:**\n`;
    text += `- شرکت استارتاپی (متعلق به امیرحسین و علی): در حال راه‌اندازی و توسعه محصولات «پلتفرم دستیار مالی هوشمند» و «پلتفرم مدیریت پروژه و تیم» و سایر استارتاپ‌ها در آینده.\n`;
    text += `- شرکت آراسب (متعلق به ابوالفضل): فعال در زمینه صادرات، واردات، ترخیص کالا و بازرگانی بین‌المللی.\n\n`;

    text += `**دستورالعمل تنظیم قرارداد:**\n`;
    text += `لطفاً بر مبنای پاسخ‌های دقیق ما که در ادامه به تفکیک بندها آمده است، یک قرارداد بنیان‌گذاران (Founder Agreement) و یک توافق‌نامه سهامداران (Shareholders Agreement) بسیار جامع، رسمی، معتبر، منصفانه و دارای بندهای حقوقی محکم به زبان فارسی بنویس. قرارداد باید شامل تعهدات، نقش‌ها، مالکیت فکری، فرآیند خروج، حل اختلاف و سناریوهای بحرانی باشد.\n\n`;
    
    text += `---\n\n`;
    text += `### پاسخ‌های ما به سوالات ۱۳گانه شراکت:\n\n`;

    categoriesData.forEach(cat => {
      text += `#### دسته ${cat.id}: ${cat.title}\n`;
      text += `*${cat.description}*\n\n`;

      cat.questions.forEach((q, index) => {
        text += `**سؤال ${cat.id}.${index + 1}: ${q.text}**\n`;
        text += `*(نوع پاسخ: ${q.type === 'consensus' ? 'توافق هر ۳ نفر' : q.type === 'individual' ? 'پاسخ انفرادی ۳ نفر' : 'پاسخ مجزا برای ۲ شرکت'})*\n`;

        const ans = answers[q.id];
        if (!ans) {
          text += `> *[پاسخی ثبت نشده است]*\n\n`;
          return;
        }

        if (q.type === 'consensus') {
          text += `> **پاسخ مشترک هر سه نفر:** ${ans.consensus?.text || '[خالی]'}\n\n`;
        } else if (q.type === 'individual') {
          text += `> - **پاسخ امیرحسین:** ${ans.individual?.amir?.text || '[پاسخ نداده]'}\n`;
          text += `> - **پاسخ علی:** ${ans.individual?.ali?.text || '[پاسخ نداده]'}\n`;
          text += `> - **پاسخ ابوالفضل:** ${ans.individual?.abolfazl?.text || '[پاسخ نداده]'}\n\n`;
        } else if (q.type === 'company') {
          text += `> - **پاسخ شرکت استارتاپی (امیر و علی):** ${ans.company?.startup?.text || '[پاسخ نداده]'}\n`;
          text += `> - **پاسخ شرکت آراسب (ابوالفضل):** ${ans.company?.arasb?.text || '[پاسخ نداده]'}\n\n`;
        }
      });
      text += `---\n\n`;
    });

    return text;
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    const text = generateAIPrompt();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download formatted text
  const handleDownloadText = () => {
    const text = generateAIPrompt();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arasb-startup-contract-prompt.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">تنظیم‌گر هوشمند قرارداد شراکت</h1>
              <p className="text-[10px] sm:text-xs text-slate-500">امیرحسین • علی • ابوالفضل (استارتاپ و آراسب)</p>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-medium text-slate-600">
                پیشرفت کل: {overallStats.percent}% ({overallStats.totalAnswered} از {overallStats.totalQuestions} سوال)
              </span>
            </div>
            
            <button
              onClick={() => setShowImportModal(true)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 bg-white flex items-center gap-1.5 text-xs font-medium"
              title="بازیابی فایل پشتیبان"
            >
              <Upload size={15} />
              <span className="hidden sm:inline">بارگذاری</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 bg-white flex items-center gap-1.5 text-xs font-medium"
              title="ذخیره فایل پشتیبان"
            >
              <Download size={15} />
              <span className="hidden sm:inline">پشتیبان‌گیری</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-100 bg-white flex items-center gap-1.5 text-xs font-medium"
              title="شروع مجدد و حذف پاسخ‌ها"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">شروع مجدد</span>
            </button>
          </div>
        </div>
      </header>

      {/* Welcome & Intro Banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white py-8 px-4 sm:px-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles size={12} />
                  جلسه صمیمانه پیرامون یک میز
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  توافق امروز، بقای فردا
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  سلام امیرحسین، علی و ابوالفضل عزیز. این ابزار پیشرفته برای شما طراحی شده تا دور یک میز بنشینید و با استفاده از یک گوشی، به بحرانی‌ترین سوالاتی که می‌تواند در آینده باعث اختلاف شود پاسخ دهید. پاسخ‌های شما پس از تکمیل به یک پرومپت هوش مصنوعی تبدیل می‌شود که با دادن آن به هوش مصنوعی (ChatGPT یا Claude)، یک قرارداد حقوقی و محکم بر مبنای نظرات خودتان دریافت خواهید کرد.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-xs font-bold text-white">شرکت استارتاپی (امیرحسین و علی)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">توسعه پلتفرم دستیار مالی هوشمند و مدیریت پروژه</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="text-xs font-bold text-white">شرکت آراسب (ابوالفضل)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">صادرات، واردات و ترخیص کالا</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0">
                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full md:w-auto bg-white hover:bg-indigo-50 text-indigo-950 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  شروع ثبت پاسخ‌ها
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm self-start sticky top-20">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 mb-1">سرفصل‌های شراکت</h3>
            <p className="text-xs text-slate-500">بین بخش‌ها جابجا شوید و پاسخ‌ها را تکمیل کنید.</p>
          </div>
          
          <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {categoriesData.map(cat => {
              const Icon = iconMap[cat.icon] || Compass;
              const stats = getCategoryStats(cat);
              const isActive = cat.id === activeCategoryId;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-right transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {cat.id}. {cat.title}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {stats.answeredCount} از {stats.total} پاسخ داده شده
                      </div>
                    </div>
                  </div>
                  
                  {stats.percent === 100 ? (
                    <CheckCircle2 size={16} className={isActive ? 'text-white' : 'text-emerald-500'} />
                  ) : stats.percent > 0 ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-500 text-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {stats.percent}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">---</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveCategoryId(99)} // 99 is Review & Export
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                activeCategoryId === 99
                  ? 'bg-indigo-950 text-white border-indigo-950 shadow-md'
                  : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <FileText size={16} />
              بررسی نهایی و دریافت قرارداد
            </button>
          </div>
        </aside>

        {/* Mobile Category Selector Drawer/Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
            <div className="bg-white w-80 h-full p-4 shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">سرفصل‌های شراکت</h3>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
                  {categoriesData.map(cat => {
                    const Icon = iconMap[cat.icon] || Compass;
                    const stats = getCategoryStats(cat);
                    const isActive = cat.id === activeCategoryId;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategoryId(cat.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-right transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">
                              {cat.id}. {cat.title}
                            </div>
                            <div className={`text-[10px] mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {stats.answeredCount} از {stats.total} پاسخ داده شده
                            </div>
                          </div>
                        </div>
                        {stats.percent === 100 ? (
                          <CheckCircle2 size={16} className={isActive ? 'text-white' : 'text-emerald-500'} />
                        ) : (
                          <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {stats.percent}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveCategoryId(99);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold bg-indigo-950 text-white hover:bg-slate-900 transition-all"
                >
                  <FileText size={16} />
                  بررسی نهایی و دریافت قرارداد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="flex-1 min-w-0">
          
          {activeCategoryId !== 99 ? (
            /* Category Form View */
            <div className="space-y-6">
              
              {/* Category Header */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 bg-indigo-600 h-full" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                      {React.createElement(iconMap[activeCategory.icon] || Compass, { size: 28 })}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-indigo-600">بخش {activeCategory.id} از ۱۳</span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">{activeCategory.title}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">{activeCategory.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 px-3 py-1.5 rounded-xl self-start sm:self-center">
                    <span className="text-xs font-bold text-indigo-900">پیشرفت این بخش:</span>
                    <span className="text-xs font-black text-indigo-600">{getCategoryStats(activeCategory).percent}%</span>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeCategory.questions.map((q, qIndex) => {
                  const qAns = answers[q.id] || {};
                  const qStatus = isQuestionAnswered(q);
                  const activeTab = activeTabs[q.id] || (q.type === 'individual' ? 'amir' : 'startup');

                  // Function to set tab for this question
                  const setQTab = (tabId: string) => {
                    setActiveTabs(prev => ({ ...prev, [q.id]: tabId }));
                  };

                  return (
                    <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                      
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2">
                            <span className="text-indigo-600 text-xs sm:text-sm bg-indigo-50 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">
                              {activeCategory.id}.{qIndex + 1}
                            </span>
                            <span>{q.text}</span>
                          </h4>
                          {q.description && (
                            <p className="text-xs text-slate-500 pr-9">{q.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 self-start sm:self-center mr-auto">
                          {/* Response Type Badge */}
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            q.type === 'consensus'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : q.type === 'individual'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {q.type === 'consensus' ? 'توافق هر ۳ نفر' : q.type === 'individual' ? 'پاسخ انفرادی ۳ نفر' : 'پاسخ مجزا برای ۲ شرکت'}
                          </span>

                          {/* Completion Badge */}
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                            qStatus.answered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {qStatus.answered ? <Check size={10} /> : null}
                            {qStatus.details}
                          </span>

                          {qStatus.answered && (
                            <button
                              onClick={() => handleClearAnswer(q.id)}
                              className="text-[10px] text-slate-400 hover:text-red-600 underline cursor-pointer"
                              title="پاک کردن پاسخ این سوال"
                            >
                              پاک‌کردن
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Body depending on type */}
                      <div className="space-y-4 pt-2">
                        
                        {/* 1. CONSENSUS (توافقی) */}
                        {q.type === 'consensus' && (
                          <div className="space-y-4">
                            {/* Predefined Options */}
                            {q.options && q.options.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 block">انتخاب از بین گزینه‌های پیشنهادی:</label>
                                <div className="grid grid-cols-1 gap-2.5">
                                  {q.options.map((opt, oIdx) => {
                                    const isSelected = qAns.consensus?.selectedOption === opt.value;
                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() => handleConsensusAnswerChange(q.id, opt.value, opt.value)}
                                        className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${
                                          isSelected
                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-medium'
                                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <span>{opt.label}</span>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                                        }`}>
                                          {isSelected && <Check size={10} />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Text Input Area */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 block">پاسخ توافق‌شده نهایی (می‌توانید بنویسید یا گزینه بالا را ویرایش کنید):</label>
                              <textarea
                                value={qAns.consensus?.text || ''}
                                onChange={(e) => handleConsensusAnswerChange(q.id, e.target.value, qAns.consensus?.selectedOption)}
                                placeholder={q.placeholder || 'پاسخ توافق شده هر سه نفر را در اینجا یادداشت کنید...'}
                                rows={3}
                                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed"
                              />
                            </div>
                          </div>
                        )}

                        {/* 2. INDIVIDUAL (انفرادی - ۳ پاسخ) */}
                        {q.type === 'individual' && (
                          <div className="space-y-4">
                            {/* Partner Tabs */}
                            <div className="flex border-b border-slate-100">
                              {PARTNERS.map(partner => {
                                const partnerAns = qAns.individual?.[partner.id as 'amir' | 'ali' | 'abolfazl']?.text?.trim();
                                const isSelected = activeTab === partner.id;
                                const isFilled = !!partnerAns;

                                let tabColorClass = 'border-indigo-600 text-indigo-600 bg-indigo-50/20';
                                if (partner.id === 'ali') tabColorClass = 'border-emerald-600 text-emerald-600 bg-emerald-50/20';
                                if (partner.id === 'abolfazl') tabColorClass = 'border-amber-600 text-amber-600 bg-amber-50/20';

                                return (
                                  <button
                                    key={partner.id}
                                    onClick={() => setQTab(partner.id)}
                                    className={`flex-1 py-3 px-2 text-center border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                                      isSelected
                                        ? tabColorClass
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    <User size={14} />
                                    <span>{partner.name}</span>
                                    {isFilled ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active Partner Input Area */}
                            {PARTNERS.map(partner => {
                              if (activeTab !== partner.id) return null;
                              
                              const partnerAns = qAns.individual?.[partner.id as 'amir' | 'ali' | 'abolfazl'] || { text: '' };
                              const partnerKey = partner.id as 'amir' | 'ali' | 'abolfazl';

                              return (
                                <div key={partner.id} className="space-y-4 animate-in fade-in duration-150">
                                  <div className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${partner.color}`}>
                                    <div className="flex items-center gap-2">
                                      <User size={16} />
                                      <span>نوبت پاسخ‌دهی: <strong>{partner.name}</strong> ({partner.role})</span>
                                    </div>
                                    <span className="text-[10px] opacity-75">گوشی را به او بدهید</span>
                                  </div>

                                  {/* Predefined Options */}
                                  {q.options && q.options.length > 0 && (
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-500 block">انتخاب از گزینه‌های پیشنهادی برای {partner.name}:</label>
                                      <div className="grid grid-cols-1 gap-2">
                                        {q.options.map((opt, oIdx) => {
                                          const isSelected = partnerAns.selectedOption === opt.value;
                                          return (
                                            <button
                                              key={oIdx}
                                              onClick={() => handleIndividualAnswerChange(q.id, partnerKey, opt.value, opt.value)}
                                              className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${
                                                isSelected
                                                  ? 'bg-indigo-50/50 border-indigo-500 text-indigo-950 font-semibold'
                                                  : 'bg-slate-50/30 hover:bg-slate-50 border-slate-200 text-slate-600'
                                              }`}
                                            >
                                              <span>{opt.label}</span>
                                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'
                                              }`}>
                                                {isSelected && <Check size={10} />}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Text Area */}
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 block">توضیح یا پاسخ شخصی {partner.name}:</label>
                                    <textarea
                                      value={partnerAns.text}
                                      onChange={(e) => handleIndividualAnswerChange(q.id, partnerKey, e.target.value, partnerAns.selectedOption)}
                                      placeholder={q.placeholder || `پاسخ و دیدگاه شخصی ${partner.name} در مورد این مسئله...`}
                                      rows={3}
                                      className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 3. COMPANY (شرکتی - ۲ پاسخ) */}
                        {q.type === 'company' && (
                          <div className="space-y-4">
                            {/* Company Tabs */}
                            <div className="flex border-b border-slate-100">
                              {COMPANIES.map(company => {
                                const companyAns = qAns.company?.[company.id as 'startup' | 'arasb']?.text?.trim();
                                const isSelected = activeTab === company.id;
                                const isFilled = !!companyAns;

                                let tabColorClass = 'border-purple-600 text-purple-600 bg-purple-50/20';
                                if (company.id === 'arasb') tabColorClass = 'border-sky-600 text-sky-600 bg-sky-50/20';

                                return (
                                  <button
                                    key={company.id}
                                    onClick={() => setQTab(company.id)}
                                    className={`flex-1 py-3 px-2 text-center border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                                      isSelected
                                        ? tabColorClass
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    <Building2 size={14} />
                                    <span>{company.name}</span>
                                    {isFilled ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active Company Input Area */}
                            {COMPANIES.map(company => {
                              if (activeTab !== company.id) return null;

                              const companyAns = qAns.company?.[company.id as 'startup' | 'arasb'] || { text: '' };
                              const companyKey = company.id as 'startup' | 'arasb';

                              return (
                                <div key={company.id} className="space-y-4 animate-in fade-in duration-150">
                                  <div className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${company.color}`}>
                                    <div className="flex items-center gap-2">
                                      <Building2 size={16} />
                                      <span>موضع شرکت: <strong>{company.name}</strong> (صاحبان: {company.owners})</span>
                                    </div>
                                    <span className="text-[10px] opacity-75">دیدگاه شرکت را ثبت کنید</span>
                                  </div>

                                  {/* Predefined Options */}
                                  {q.options && q.options.length > 0 && (
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-500 block">انتخاب از گزینه‌های پیشنهادی برای {company.name}:</label>
                                      <div className="grid grid-cols-1 gap-2">
                                        {q.options.map((opt, oIdx) => {
                                          const isSelected = companyAns.selectedOption === opt.value;
                                          return (
                                            <button
                                              key={oIdx}
                                              onClick={() => handleCompanyAnswerChange(q.id, companyKey, opt.value, opt.value)}
                                              className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${
                                                isSelected
                                                  ? 'bg-indigo-50/50 border-indigo-500 text-indigo-950 font-semibold'
                                                  : 'bg-slate-50/30 hover:bg-slate-50 border-slate-200 text-slate-600'
                                              }`}
                                            >
                                              <span>{opt.label}</span>
                                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'
                                              }`}>
                                                {isSelected && <Check size={10} />}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Text Area */}
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 block">توضیح یا تعریف اختصاصی {company.name}:</label>
                                    <textarea
                                      value={companyAns.text}
                                      onChange={(e) => handleCompanyAnswerChange(q.id, companyKey, e.target.value, companyAns.selectedOption)}
                                      placeholder={q.placeholder || `شرایط و توافق این موضوع برای ${company.name}...`}
                                      rows={3}
                                      className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all leading-relaxed"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 pb-8">
                <button
                  onClick={() => {
                    if (activeCategoryId > 1) {
                      setActiveCategoryId(activeCategoryId - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={activeCategoryId === 1}
                  className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                    activeCategoryId === 1
                      ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                      : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ChevronRight size={16} />
                  سرفصل قبلی
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveCategoryId(99);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hidden sm:flex px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border-2 border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 transition-all items-center gap-1.5"
                  >
                    بررسی نهایی قرارداد
                    <FileText size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if (activeCategoryId < 13) {
                        setActiveCategoryId(activeCategoryId + 1);
                      } else {
                        setActiveCategoryId(99);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
                  >
                    {activeCategoryId === 13 ? 'مشاهده پیش‌نویس نهایی' : 'سرفصل بعدی'}
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Review and Export View */
            <div className="space-y-6">
              
              {/* Export Page Header */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 bg-emerald-600 h-full" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">مرحله نهایی شبیه‌سازی قرارداد</span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">بررسی و صدور نسخه نهایی</h2>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                      آفرین! شما به تمام یا بخش عمده‌ای از سوالات شراکت پاسخ دادید. اکنون زمان آن است که خروجی را به هوش مصنوعی تحویل دهید تا توافق‌نامه‌ای در سطح استانداردهای بین‌المللی برای شما بنویسد. در پایین وضعیت تمام سوالات و در نهایت متن پرومپت نهایی را مشاهده می‌کنید.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5 shrink-0">
                    <button
                      onClick={handleCopyToClipboard}
                      className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                        copied
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'پرومپت کپی شد!' : 'کپی کل پرومپت برای هوش مصنوعی'}
                    </button>

                    <button
                      onClick={handleDownloadText}
                      className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-850 text-white flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Download size={16} />
                      دانلود فایل متنی (TXT)
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">پیشرفت کل</span>
                    <strong className="text-lg font-extrabold text-indigo-600">{overallStats.percent}%</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">پاسخ‌های ثبت شده</span>
                    <strong className="text-lg font-extrabold text-emerald-600">{overallStats.totalAnswered} از {overallStats.totalQuestions} سؤال</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">سرفصل‌های کامل شده</span>
                    <strong className="text-lg font-extrabold text-purple-600">
                      {categoriesData.filter(c => getCategoryStats(c).percent === 100).length} از ۱۳
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Table / Accordion */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Info size={18} className="text-indigo-600" />
                  بررسی وضعیت پاسخ‌ها به تفکیک بندها
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  می‌توانید با کلیک روی هر بخش به آن بخش برگردید و پاسخ‌های ناقص را تکمیل کنید. سوالاتی که فاقد پاسخ کامل هستند با علامت هشدار نارنجی مشخص شده‌اند.
                </p>

                <div className="space-y-3 pt-2">
                  {categoriesData.map(cat => {
                    const stats = getCategoryStats(cat);
                    const Icon = iconMap[cat.icon] || Compass;

                    return (
                      <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-slate-50/75 px-4 py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-800">{cat.id}. {cat.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium">
                              {stats.answeredCount} از {stats.total} پاسخ
                            </span>
                            <button
                              onClick={() => {
                                setActiveCategoryId(cat.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-xs text-indigo-600 font-bold hover:underline"
                            >
                              ویرایش این بخش
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-white divide-y divide-slate-100">
                          {cat.questions.map((q, idx) => {
                            const status = isQuestionAnswered(q);
                            const ans = answers[q.id];

                            return (
                              <div key={q.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-700">{cat.id}.{idx + 1} {q.text}</span>
                                  
                                  {/* Render a tiny summary of the answer */}
                                  <div className="text-[11px] text-slate-400 mt-1 max-w-xl truncate">
                                    {status.answered ? (
                                      q.type === 'consensus' ? (
                                        <span>پاسخ: {ans.consensus?.text}</span>
                                      ) : q.type === 'individual' ? (
                                        <span>
                                          امیر: {ans.individual?.amir?.text ? '✓' : '✗'} | 
                                          علی: {ans.individual?.ali?.text ? '✓' : '✗'} | 
                                          ابوالفضل: {ans.individual?.abolfazl?.text ? '✓' : '✗'}
                                        </span>
                                      ) : (
                                        <span>
                                          استارتاپ: {ans.company?.startup?.text ? '✓' : '✗'} | 
                                          آراسب: {ans.company?.arasb?.text ? '✓' : '✗'}
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-amber-600 font-medium flex items-center gap-1">
                                        <AlertCircle size={10} />
                                        پاسخ ناقص یا ثبت نشده
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className={`self-start sm:self-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  status.answered
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {status.details}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final Prompt Presentation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-600" />
                      پیش‌نمایش پرومپت نهایی تولید قرارداد شراکت (جهت ارائه به هوش مصنوعی)
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      این متن کاملاً ساختاریافته است. آن را کپی کنید و در چت‌باکس هوش مصنوعی (مانند Claude-3.5-Sonnet یا GPT-4o) وارد کنید تا شگفت‌زده شوید.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleCopyToClipboard}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'کپی شد!' : 'کپی متن پرومپت'}
                  </button>
                </div>

                <div className="relative bg-slate-900 rounded-xl overflow-hidden p-4 sm:p-5 text-slate-100 max-h-[500px] overflow-y-auto">
                  <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-right font-sans" dir="rtl">
                    {generateAIPrompt()}
                  </pre>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none" />
                </div>

                {/* Info Alert on how to use with AI */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                  <Info className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-indigo-950">چگونه با این پرومپت بهترین قرارداد را بسازیم؟</h4>
                    <p className="text-[11px] sm:text-xs text-indigo-900/80 leading-relaxed">
                      ۱. دکمه <strong>«کپی کل پرومپت»</strong> را بزنید.<br />
                      ۲. وارد سایت <a href="https://claude.ai" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-indigo-950 flex-inline items-center gap-0.5">Claude.ai <ExternalLink size={10} className="inline" /></a> یا <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-indigo-950 flex-inline items-center gap-0.5">ChatGPT <ExternalLink size={10} className="inline" /></a> شوید.<br />
                      ۳. متن کپی‌شده را در چت ارسال کنید.<br />
                      ۴. هوش مصنوعی یک قرارداد شراکت فوق‌العاده حرفه‌ای و جزئی به شما خروجی می‌دهد. شما می‌توانید پس از خواندن آن، از هوش مصنوعی بخواهید بخش‌های خاصی را ویرایش یا تکمیل‌تر کند.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Back */}
              <div className="flex items-center justify-between pt-4 pb-8">
                <button
                  onClick={() => {
                    setActiveCategoryId(13);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                >
                  <ChevronRight size={16} />
                  بازگشت به سوالات (دسته ۱۳)
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Footer / Progress Bar */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">شرکای تجاری:</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">امیرحسین</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">علی</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">ابوالفضل</span>
          </div>
          
          <div>
            ساخته شده برای پیشگیری از اختلافات و هموار کردن مسیر موفقیت استارتاپ و آراسب © ۱۴۰۵
          </div>
        </div>
      </footer>

      {/* Floating Menu Toggle for Mobile */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-all cursor-pointer"
        title="لیست دسته‌بندی‌ها"
      >
        <Menu size={22} />
      </button>

      {/* Modals & Dialogs */}

      {/* 1. Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="bg-red-50 text-red-600 p-3 rounded-full w-fit">
              <RotateCcw size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">شروع مجدد و حذف پاسخ‌ها؟</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                آیا مطمئن هستید که می‌خواهید تمام پاسخ‌های ثبت شده تا الان را حذف کنید؟ این اقدام قابل بازگشت نیست مگر اینکه قبلاً فایل پشتیبان دانلود کرده باشید.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleResetAll}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all"
              >
                بله، تمام پاسخ‌ها را حذف کن
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all border border-slate-200"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Import Backup Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full w-fit">
              <Upload size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">بارگذاری اطلاعات از روی فایل پشتیبان</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                اگر قبلاً فایل پشتیبان با پسوند `.json` از این سایت ذخیره کرده‌اید، می‌توانید آن را انتخاب کنید تا پاسخ‌هایتان دقیقاً بازیابی شود.
              </p>
            </div>
            
            <div className="pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-dashed border-indigo-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileText size={28} className="text-indigo-500" />
                <span className="text-xs font-bold">انتخاب فایل پشتیبان (.json)</span>
                <span className="text-[10px] text-slate-400">یک فایل با فرمت معتبر انتخاب کنید</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-200"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
