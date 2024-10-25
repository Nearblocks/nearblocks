import { useThemeStore } from '@/stores/theme';

/**
 * @interface Props
 * @param {string} [value] - The data value to be encoded as a QR code (e.g., a URL, text, etc.).
 * @param {number} [width] - The width of the QR code component.
 * @param {number} [height] - The height of the QR code component.
 */
interface Props {
  value: string;
  width: number;
  height: number;
  theme?: string;
}

const QrCode = (props: Props) => {
  const theme = useThemeStore((store) => store.theme);
  const colorDark = theme === 'dark' ? '#ffffff' : '#000000';
  const colorLight = theme === 'dark' ? '#000000' : '#ffffff';

  const srcData = `
    <html style="background-color: ${theme === 'dark' ? '#0d0d0d' : '#fffff'};">
    <body>
      <div id="qrcode" style="display: flex; flex-direction: column; justify-content: center; align-items: center;"></div>
    
      <script src="https://cdn.jsdelivr.net/npm/easyqrcodejs@4.5.0/dist/easy.qrcode.min.js"></script>
      <script type="text/javascript">
        new QRCode(document.getElementById("qrcode"), {
        text: "${props.value}",
        width: ${props.width},
        height: ${props.height},
        colorDark:"${colorDark}",
        colorLight: "${colorLight}",
        correctLevel: QRCode.CorrectLevel.H, // L, M, Q, H
        logoBackgroundTransparent: true,
        logoWidth: 150, 
        logoHeight: 150,
        dotScale: .6,
        dotScaleTiming: .6,
        dotScaleA:.6,
      });
       </script> 
    </body>
    </html>
    `;

  return (
    <div>
      <iframe
        srcDoc={srcData}
        style={{
          width: 320,
          minWidth: 320,
          height: 220,
          minHeight: 220,
          marginTop: 30,
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
};
export default QrCode;
