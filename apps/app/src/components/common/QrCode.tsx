import { useTheme } from 'next-themes';

/**
 * @interface Props
 * @param {string} [value] - The data value to be encoded as a QR code (e.g., a URL, text, etc.).
 * @param {number} [width] - The width of the QR code component.
 * @param {number} [height] - The height of the QR code component.
 */
interface Props {
  height: number;
  theme?: string;
  value: string;
  width: number;
}

const QrCode = (props: Props) => {
  const { theme } = useTheme();

  const colorDark = theme === 'dark' ? '#ffffff' : '#000000';
  const colorLight = theme === 'dark' ? '#000000' : '#ffffff';

  const srcData = `
    <html style="background-color: ${theme === 'dark' ? '#0d0d0d' : '#fffff'};">
    <body>
      <div id="qrcode" style="display: flex; flex-direction: column; justify-content: center; align-items: center;"></div>
    
      <script src="https://cdn.jsdelivr.net/npm/easyqrcodejs@4.5.0/dist/easy.qrcode.min.js"></script>
      <script type="text/javascript">
        new QRCode(document.getElementById("qrcode"), {
        text: "${props?.value}",
        width: ${props?.width},
        height: ${props?.height},
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
          backgroundColor: 'transparent',
          height: 220,
          marginTop: 30,
          minHeight: 220,
          minWidth: 320,
          width: 320,
        }}
      />
    </div>
  );
};
export default QrCode;
