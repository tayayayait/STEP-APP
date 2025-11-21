import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, User, EncouragementResponse } from './types';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { generateEncouragement } from './services/geminiService';
import { 
  Activity, 
  CheckCircle, 
  Share2, 
  RefreshCw, 
  ShieldCheck, 
  Phone, 
  Footprints,
  HeartPulse,
  MessageCircle
} from 'lucide-react';

// Icons wrapped for size consistency
const Icon = ({ component: Component, size = 24, className = "" }: any) => (
  <Component size={size} className={className} />
);

const App: React.FC = () => {
  // --- State Management ---
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [user, setUser] = useState<User | null>(null);
  const [steps, setSteps] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [encouragement, setEncouragement] = useState<EncouragementResponse | null>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // --- Effects ---

  // Load initial data or check local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('rehab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView(ViewState.DASHBOARD);
      
      // Load saved steps for today
      const savedSteps = localStorage.getItem(`steps_${new Date().toISOString().split('T')[0]}`);
      if (savedSteps) setSteps(parseInt(savedSteps));
    }
  }, []);

  const fetchEncouragement = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await generateEncouragement(steps, user.targetSteps, user.name);
      setEncouragement(response);
    } catch (e) {
      console.error("Failed to get encouragement", e);
    }
  }, [steps, user]);

  useEffect(() => {
    if (view === ViewState.DASHBOARD && user) {
      fetchEncouragement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]); 

  // --- Handlers ---

  const handleLogin = () => {
    // Basic length check
    if (phoneNumberInput.length < 4) return; 
    
    // Simulate User Creation (Korean Persona)
    const newUser: User = {
      id: 'u123',
      name: '김순자', // Korean senior name
      targetSteps: 3000,
      phoneNumber: phoneNumberInput
    };
    setUser(newUser);
    setView(ViewState.PERMISSIONS);
  };

  const handleGrantPermissions = () => {
    localStorage.setItem('rehab_user', JSON.stringify(user));
    setView(ViewState.DASHBOARD);
  };

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate sync delay
    setTimeout(() => {
      const addedSteps = Math.floor(Math.random() * 100) + 10;
      const newTotal = steps + addedSteps;
      setSteps(newTotal);
      localStorage.setItem(`steps_${new Date().toISOString().split('T')[0]}`, newTotal.toString());
      setIsSyncing(false);
      fetchEncouragement();
    }, 1500);
  };

  const handleAddWalk = () => {
    // Manual entry simulation
    const newSteps = steps + 500;
    setSteps(newSteps);
    localStorage.setItem(`steps_${new Date().toISOString().split('T')[0]}`, newSteps.toString());
    fetchEncouragement();
  };

  const handleShare = async () => {
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 3000);
  };

  // Formatter for Korean Date
  const getKoreanDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
    return `${month}월 ${day}일 ${weekDay}요일`;
  };

  // --- Views ---

  const renderOnboarding = () => (
    <div className="flex flex-col h-full p-8 justify-center items-center bg-white text-center animate-fade-in">
      <div className="bg-blue-50 p-8 rounded-full mb-10 shadow-inner">
        <Icon component={Footprints} size={72} className="text-rehab-blue" />
      </div>
      
      <h1 className="text-4xl font-black mb-4 text-rehab-text leading-tight">
        재활워킹<br/>
        <span className="text-2xl font-medium text-gray-500">건강한 회복의 시작</span>
      </h1>
      
      <p className="text-xl text-gray-600 mb-12 leading-relaxed break-keep">
        복잡한 기능 없이<br/>걷기만 하세요. 기록은 제가 할게요.
      </p>

      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col text-left">
          <label className="text-lg font-bold mb-3 text-gray-800">전화번호를 입력해주세요</label>
          <input 
            type="tel" 
            placeholder="010-1234-5678"
            className="w-full text-2xl p-4 border-2 border-gray-200 rounded-2xl focus:border-rehab-blue focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all placeholder-gray-300 font-medium tracking-wider"
            value={phoneNumberInput}
            onChange={(e) => setPhoneNumberInput(e.target.value)}
          />
        </div>
        <Button onClick={handleLogin} fullWidth disabled={phoneNumberInput.length < 3}>
          시작하기
        </Button>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="flex flex-col h-full p-8 bg-white animate-slide-up">
      <h2 className="text-3xl font-black mb-10 text-center text-gray-900">앱 사용 권한 안내</h2>
      
      <div className="flex-1 space-y-6">
        <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 transform transition-transform hover:scale-[1.02]">
          <div className="flex items-start gap-5">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-rehab-blue flex-shrink-0">
              <Icon component={Activity} size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">신체 활동 측정</h3>
              <p className="text-lg text-gray-600 leading-relaxed break-keep">
                휴대폰을 주머니에 넣고 걷기만 해도 걸음 수를 자동으로 셀 수 있어요.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-100 transform transition-transform hover:scale-[1.02]">
           <div className="flex items-start gap-5">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-rehab-green flex-shrink-0">
              <Icon component={ShieldCheck} size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">소중한 기록 보호</h3>
              <p className="text-lg text-gray-600 leading-relaxed break-keep">
                어르신의 운동 기록은 안전하게 보관되며, 가족과 의사 선생님만 볼 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={handleGrantPermissions} fullWidth variant="success" className="text-lg">
          동의하고 계속하기
        </Button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!user) return null;
    const progress = Math.min(100, Math.round((steps / user.targetSteps) * 100));
    const isGoalAchieved = steps >= user.targetSteps;

    return (
      <div className="flex flex-col h-full bg-gray-50 animate-fade-in relative">
        {/* Header */}
        <header className="bg-white px-6 py-5 shadow-sm z-10 sticky top-0">
          <div className="flex justify-between items-end max-w-md mx-auto">
            <div>
              <p className="text-lg text-gray-500 font-medium mb-1">{getKoreanDate()}</p>
              <h2 className="text-3xl font-black text-gray-900 leading-none">
                안녕하세요, <span className="text-rehab-blue">{user.name}</span>님!
              </h2>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-rehab-blue text-xl font-bold shadow-inner">
              {user.name[0]}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-md mx-auto w-full pb-24">
          
          {/* AI Message Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 mb-8 relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
            
            <div className="flex gap-2 mb-3 items-center text-blue-100">
              <Icon component={HeartPulse} size={20} />
              <span className="text-sm font-bold tracking-wider">건강 코치의 한마디</span>
            </div>
            <p className="text-2xl font-bold leading-snug break-keep relative z-10">
              {encouragement ? `"${encouragement.message}"` : "오늘의 응원 메시지를 불러오고 있어요..."}
            </p>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100 flex flex-col items-center mb-6 relative">
            <div className="flex items-center gap-2 mb-2">
               <Icon component={Activity} size={20} className="text-gray-400" />
               <h3 className="text-xl font-bold text-gray-500">오늘의 걸음 수</h3>
            </div>
            
            <ProgressBar current={steps} target={user.targetSteps} />
            
            {isGoalAchieved && (
               <div className="absolute top-6 right-6 text-yellow-400 animate-bounce drop-shadow-md">
                 <Icon component={CheckCircle} size={40} fill="currentColor" className="text-white" />
               </div>
            )}
            
            {isGoalAchieved ? (
              <p className="text-center text-rehab-green font-bold text-lg bg-green-50 px-4 py-2 rounded-full mt-2 animate-pulse">
                목표를 달성하셨어요! 대단해요! 🎉
              </p>
            ) : (
              <p className="text-center text-gray-400 font-medium mt-2">
                목표까지 <strong className="text-rehab-blue">{(user.targetSteps - steps).toLocaleString()}</strong> 걸음 남았어요
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={handleSync} 
              className="h-auto py-6 flex-col gap-2 rounded-3xl border-2"
              disabled={isSyncing}
            >
              <div className={`p-3 bg-blue-50 rounded-full text-rehab-blue ${isSyncing ? "animate-spin" : ""}`}>
                <Icon component={RefreshCw} size={28} />
              </div>
              <span className="text-lg font-bold text-gray-700">새로고침</span>
            </Button>
            
             <Button 
              variant="primary" 
              onClick={handleAddWalk} 
              className="h-auto py-6 flex-col gap-2 rounded-3xl shadow-lg shadow-blue-200"
            >
              <div className="p-3 bg-white/20 rounded-full text-white">
                <Icon component={Footprints} size={28} />
              </div>
              <span className="text-lg font-bold">걷기 추가</span>
            </Button>
          </div>

          {steps > 0 && (
             <div className="mt-2">
               <Button variant="kakao" fullWidth onClick={handleShare} icon={<Icon component={MessageCircle} fill="currentColor" />} className="rounded-3xl shadow-md">
                 가족에게 자랑하기
               </Button>
             </div>
          )}

        </main>
        
        {/* Share Modal (Overlay) */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-slide-up">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                <Icon component={MessageCircle} size={40} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-gray-900">전송 완료!</h3>
              <p className="text-gray-600 text-xl mb-8 leading-relaxed break-keep">
                가족들에게<br/>
                <strong className="text-rehab-blue text-2xl">{steps} 걸음</strong> 달성 소식을<br/>
                카카오톡으로 보냈어요.
              </p>
              <Button variant="secondary" fullWidth onClick={() => setShowShareModal(false)}>닫기</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-rehab-text selection:bg-blue-200">
      <div className="max-w-md mx-auto bg-white h-screen shadow-2xl overflow-hidden relative">
        {view === ViewState.ONBOARDING && renderOnboarding()}
        {view === ViewState.PERMISSIONS && renderPermissions()}
        {view === ViewState.DASHBOARD && renderDashboard()}
      </div>
    </div>
  );
};

export default App;