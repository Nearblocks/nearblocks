/**
 * Component: CommentsInputField
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: The component enables users to input and compose comments, including text and image uploads.
 * @interface Props
 * @param {Function} [onChange] - A function triggered when the content changes.
 * @param {Function} [composeButton] - A function to render the compose button.
 */

import Iframe from '@/includes/Common/Iframe';
import { CommentContent } from '@/includes/types';

interface Props {
  onChange?: (content: CommentContent | any) => void;
  composeButton?: (callback: () => void) => React.ReactNode;
}
export default function (props: Props) {
  const [text, setText] = useState<string>('');
  const [jContent, setJContent] = useState('');
  const [img, setImg] = useState<{ cid?: string; url?: string }>({});
  const [msg, setMsg] = useState('Upload an Image');
  const [markdownEditor, setMarkdownEditor] = useState(false);
  const content: CommentContent | any = (text || img.cid || img.url) && {
    type: 'md',
    text: text,
    image: img.url
      ? { url: img.url }
      : img.cid
      ? { ipfs_cid: img.cid }
      : undefined,
  };
  const uploadFile = (files: string) => {
    setMsg('Uploading..');
    asyncFetch('https://ipfs.near.social/add', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: files[0],
    })
      .then((response: any) => {
        setImg(response.body);
        setMsg('Replace');
      })
      .catch(() => {
        setMsg('Upload an Image');
      });
  };
  const ipfsUrl = (cid: string) => `https://ipfs.near.social/ipfs/${cid}`;

  const onChange = (text: string | any) => {
    setText(text);
  };

  const JContent = JSON.stringify(content);
  if (props.onChange && JContent !== jContent) {
    setJContent(JContent);

    props.onChange({ content });
  }

  const onCompose = () => {
    setText('');
    setImg({});
    setMsg('Upload an Image');
  };

  const embedCss = `
.rc-md-editor {
  border: 0;
}
.rc-md-editor .editor-container>.section {
  border: 0;
}
.rc-md-editor .editor-container .sec-md .input {
  overflow-y: auto;
  padding: 8px 0 !important;
  line-height: normal;
}
`;
  const code = `
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/react-markdown-editor-lite@1.3.4/lib/index.js" crossorigin></script>
<link rel="stylesheet" href="https://unpkg.com/react-markdown-editor-lite@1.3.4/lib/index.css" />

<style>
${embedCss}
</style>

<div id="react-root"></div>

<script>
function TestReact(props) {
  const [value, setValue] = React.useState(props.initialText || "");
  return React.createElement(ReactMarkdownEditorLite.default, {
      value,
      view: { menu: true, md: true, html: false },
      canView: { menu: true, md: false, html: false, fullScreen: false, hideMenu: true },
      onChange: ({ text }) => {
        setValue(text);
        window.top.postMessage(text, "*");
      },
      renderHTML: () => {},
      className: "full",
    });
}

const domContainer = document.querySelector('#react-root');
const root = ReactDOM.createRoot(domContainer);

window.addEventListener("message", (event) => {
  root.render(React.createElement(TestReact, {
    initialText: event.data,
  }));
});

</script>
`;
  return (
    <div className="flex items-center px-3 py-2">
      <button
        type="button"
        className="whitespace-nowrap inline-flex justify-center p-2 text-nearblue-600 rounded-lg cursor-pointer hover:bg-neargray-800 bg-neargray-700 hover:text-nearblue-600"
      >
        <div className="inline-block">
          {img?.cid && (
            <div
              className="inline-block me-2 overflow-hidden align-middle"
              style={{ width: '2.5em', height: '2.5em' }}
            >
              <img
                className="rounded w-100 h-100"
                style={{ objectFit: 'cover' }}
                src={ipfsUrl(img?.cid)}
                alt="upload preview"
              />
            </div>
          )}
          <Files
            multiple={false}
            accepts={['image/*']}
            minFileSize={1}
            clickable
            onChange={uploadFile}
          >
            {msg}
          </Files>
        </div>
      </button>

      <button
        type="button"
        className="ml-2 p-2 text-nearblue-600 rounded-lg cursor-pointer hover:bg-neargray-800 bg-neargray-700 hover:text-nearblue-600"
        onClick={() => setMarkdownEditor((prevState) => !prevState)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
          <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0" />
        </svg>
      </button>
      {markdownEditor ? (
        <>
          <Iframe
            className="ml-2 w-full border"
            srcDoc={code}
            message={text || ''}
            onMessage={onChange}
          />
        </>
      ) : (
        <textarea
          key="textarea"
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
          value={text || ''}
          onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(event.target.value)
          }
          placeholder={"What's happening?"}
        />
      )}

      <div>{props.composeButton && props.composeButton(onCompose)}</div>
    </div>
  );
}
