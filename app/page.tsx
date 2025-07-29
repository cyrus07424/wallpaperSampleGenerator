'use client';

import { useState, useRef, useCallback } from 'react';

type MockupType = 'iphone' | 'android';

interface AppIcon {
  id: string;
  src: string;
  x: number;
  y: number;
}

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<MockupType>('iphone');
  const [showAppIcons, setShowAppIcons] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const appIcons: AppIcon[] = [
    { id: 'app1', src: '/icons/app1.svg', x: 30, y: 100 },
    { id: 'app2', src: '/icons/app2.svg', x: 110, y: 100 },
    { id: 'app3', src: '/icons/app3.svg', x: 190, y: 100 },
    { id: 'app4', src: '/icons/app4.svg', x: 30, y: 180 },
  ];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const generateMockup = useCallback(async () => {
    if (!uploadedImage || !canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 600;

    try {
      // Load and draw wallpaper
      const wallpaperImg = new Image();
      wallpaperImg.onload = async () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw wallpaper (cropped to screen area)
        const screenX = selectedMockup === 'iphone' ? 15 : 10;
        const screenY = selectedMockup === 'iphone' ? 60 : 40;
        const screenWidth = selectedMockup === 'iphone' ? 270 : 280;
        const screenHeight = selectedMockup === 'iphone' ? 480 : 520;

        // Calculate aspect ratio and crop
        const imgRatio = wallpaperImg.width / wallpaperImg.height;
        const screenRatio = screenWidth / screenHeight;

        let sx = 0, sy = 0, sw = wallpaperImg.width, sh = wallpaperImg.height;

        if (imgRatio > screenRatio) {
          // Image is wider than screen
          sw = wallpaperImg.height * screenRatio;
          sx = (wallpaperImg.width - sw) / 2;
        } else {
          // Image is taller than screen
          sh = wallpaperImg.width / screenRatio;
          sy = (wallpaperImg.height - sh) / 2;
        }

        ctx.drawImage(wallpaperImg, sx, sy, sw, sh, screenX, screenY, screenWidth, screenHeight);

        // Load and draw phone frame
        const frameImg = new Image();
        frameImg.onload = async () => {
          ctx.drawImage(frameImg, 0, 0, 300, 600);

          // Draw app icons if enabled
          if (showAppIcons) {
            for (const icon of appIcons) {
              const iconImg = new Image();
              iconImg.onload = () => {
                ctx.drawImage(iconImg, icon.x, icon.y, 60, 60);
              };
              iconImg.src = icon.src;
            }
          }

          // Draw clock if enabled
          if (showClock) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });

            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(timeString, 150, 40);
            ctx.shadowBlur = 0;
          }

          setIsGenerating(false);
        };
        frameImg.src = `/mockups/${selectedMockup}-frame.svg`;
      };
      wallpaperImg.src = uploadedImage;
    } catch (error) {
      console.error('Error generating mockup:', error);
      setIsGenerating(false);
    }
  }, [uploadedImage, selectedMockup, showAppIcons, showClock]);

  const downloadMockup = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `wallpaper-mockup-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            スマートフォン壁紙サンプルジェネレーター
          </h1>
          <p className="text-center text-gray-600 mb-8">
            お気に入りの画像をアップロードして、スマートフォンの壁紙サンプルを生成しましょう
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  壁紙画像を選択
                </button>
                {uploadedImage && (
                  <div className="mt-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded wallpaper"
                      className="max-w-full h-32 object-cover rounded-lg mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* Mockup Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">デバイス選択</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedMockup('iphone')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedMockup === 'iphone'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    iPhone
                  </button>
                  <button
                    onClick={() => setSelectedMockup('android')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedMockup === 'android'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    Android
                  </button>
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-lg font-semibold mb-3">オプション</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showAppIcons}
                      onChange={(e) => setShowAppIcons(e.target.checked)}
                      className="mr-2"
                    />
                    アプリアイコンを表示
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showClock}
                      onChange={(e) => setShowClock(e.target.checked)}
                      className="mr-2"
                    />
                    時計を表示
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateMockup}
                disabled={!uploadedImage || isGenerating}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'サンプル生成中...' : 'サンプル生成'}
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">プレビュー</h3>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 rounded-lg max-w-full h-auto"
                  style={{ maxHeight: '500px' }}
                />
                {!uploadedImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">画像を選択してください</p>
                  </div>
                )}
              </div>
              
              {canvasRef.current?.toDataURL() && (
                <button
                  onClick={downloadMockup}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  画像をダウンロード
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center text-gray-500 mt-8">
        &copy; 2025 <a href="https://github.com/cyrus07424" target="_blank" className="hover:text-indigo-600">cyrus</a>
      </footer>
    </div>
  );
}
