import fs from 'fs';
import replaceInFiles from 'replace-in-files';
import postcss from 'postcss';
import postcssPurgecss from '@fullhuman/postcss-purgecss';
import cssnano from 'cssnano';
import tailwindcss from 'tailwindcss';

const transpiledPathPrefix = '.bos/transpiled/src/bos-components';
const css = fs.readFileSync('./src/public/styles.css', 'utf8');
const outputFilePathApp = '../app/public/common.css';

async function build() {
  // Process the CSS
  let stylesByFile = {};

  const postcssPlugins = [
    tailwindcss(),
    postcssPurgecss({
      content: ['src/**/*.tsx'], // Files to search for used classes
    }),
    cssnano(),
  ];
  const processComponentImports = (filePath, processedFiles = new Set()) => {
    if (processedFiles.has(filePath)) {
      // Prevent infinite recursion due to cyclic dependencies or repetitive file reads
      return '';
    }
    processedFiles.add(filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;

      // Regular expression to match the import statement
      const importRegex = /import\s+(\w+)\s+from\s+"@\/includes\/([^"]*)";/;

      while (true) {
        const match = updatedContent.match(importRegex);
        if (!match) {
          break;
        }

        const [fullMatch, componentName, componentPath] = match;
        const absolutePath = `${transpiledPathPrefix}/../includes/${componentPath}.jsx`;
        const importedContent = processComponentImports(
          absolutePath,
          processedFiles,
        );

        updatedContent = updatedContent.replace(fullMatch, importedContent);
      }

      return updatedContent.replace(/export\s+default\s+(.*?);/, '').trim();
    } catch (error) {
      console.error('Error in processImports:', error);
      return '';
    }
  };

  await postcss(postcssPlugins)
    .process(css, { from: 'style.css' })
    .then((result) => {
      stylesByFile = result.css;
      fs.writeFileSync(outputFilePathApp, stylesByFile);
    })
    .catch(() => {});

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /export\s+default\s+function[^(]*\((.*)/gms,
    to: (_match, rest) => {
      return `function MainComponent(${rest}\nreturn MainComponent(props, context);`;
    },
  });

  await new Promise((resolve) => {
    fs.rename(
      `${transpiledPathPrefix}/includes`,
      `${transpiledPathPrefix}/../includes`,
      () => {
        resolve();
      },
    );
  });

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /import\s+(\w+)\s+from\s+"@\/includes\/([^"]*)";/gm,
    to: (_match) => {
      // extract component name and path to the imported component
      const [component, componentName, componentPath] = _match.match(
        /import\s+(\w+)\s+from\s+"@\/includes\/([^"]*)";/,
      );
      // read content of the component from the path
      const fileToPath = `${transpiledPathPrefix}/../includes/${componentPath}.jsx`;
      const importedComponentContent = processComponentImports(fileToPath);
      return `/* INCLUDE COMPONENT: "includes/${componentPath}.jsx" */\n${importedComponentContent}/* END_INCLUDE COMPONENT: "includes/${componentPath}.jsx" */`;
    },
  });

  const processFileImports = (fileContent, importedFileContent) => {
    try {
      const functionCalls = fileContent
        .toString()
        .match(/([a-zA-Z_]+\w*)\s*\(/g);
      if (functionCalls) {
        const importStatements = importedFileContent.match(
          /import\s+.*?\s+from\s+['"](.*?)['"]/g,
        );
        if (importStatements) {
          functionCalls.forEach((name) => {
            const pattern = new RegExp(name.replace(/\s*\(/, ''), 'g');
            importStatements.forEach((importStatement) => {
              if (pattern.test(importStatement)) {
                const extraImports = importStatement.match(
                  /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']@([^"']+)["']/,
                );
                if (extraImports) {
                  const importToPath = extraImports[2].trim();
                  const extraNames = extraImports[0]
                    .match(/\{([^}]*)\}/)[1] // Get the content inside curly braces
                    .split(',') // Split by comma
                    .map((name) => name.trim()) // Remove leading/trailing spaces
                    .filter((name) => name);
                  // read file content from the path with out export statement
                  const importedFileContent = fs
                    .readFileSync(
                      `${transpiledPathPrefix}/..${importToPath}.jsx`,
                      'utf8',
                    )
                    .replace(/export /g, '');

                  extraNames.forEach(function (name) {
                    const functionName = `${name.trim()}`;
                    const regex = new RegExp(
                      `function ${functionName}\\s*\\([^)]*\\)\\s*{((?:[^{}]*|{[^{}]*})*?)}`,
                    );
                    // extract the function body that matches the name from the file content
                    const functionMatch = importedFileContent.match(regex);
                    if (functionMatch) {
                      fileContent += functionMatch[0] + '\n';
                    }
                  });
                }
              }
            });
          });
        }
      }
      return fileContent;
    } catch (error) {
      console.error('Error in processImports:', error);
      return '';
    }
  };

  await replaceInFiles({
    files: [`${transpiledPathPrefix}/**/*.jsx`],
    from: /import\s+{[^}]*}\s+from\s+"@\/includes\/([^"]*)";/gm,
    to: (_match, importPath) => {
      const extractedNames = _match
        .match(/\{([^}]*)\}/)[1] // Get the content inside curly braces
        .split(',') // Split by comma
        .map((name) => name.trim()) // Remove leading/trailing spaces
        .filter((name) => name);
      // read file content from the path with out export statement
      const importedFileContent = fs
        .readFileSync(
          `${transpiledPathPrefix}/../includes/${importPath}.jsx`,
          'utf8',
        )
        .replace(/export /g, '');
      let contentImport = '';
      // loops through each function name to extract function content
      extractedNames.forEach(function (name) {
        const functionName = `${name.trim()}`;

        const regex = new RegExp(
          `function ${functionName}\\s*\\([^)]*\\)\\s*{((?:[^{}]*|{[^{}]*})*?)}`,
        );
        // extract the function body that matches the name from the file content
        const functionMatch = importedFileContent.match(regex);
        if (functionMatch) {
          contentImport += functionMatch[0] + '\n';
        }
        // check if any imported functions used in the etracted content
        contentImport = processFileImports(contentImport, importedFileContent);
      });

      return `/* INCLUDE: "includes/${importPath}.jsx" */\n${contentImport}/* END_INCLUDE: "includes/${importPath}.jsx" */`;
    },
  });

  const packageJson = JSON.parse(
    fs.readFileSync(new URL('./package.json', import.meta.url)),
  );

  await new Promise((resolve) => {
    fs.rename(
      transpiledPathPrefix,
      `${transpiledPathPrefix}/../${packageJson.name}`,
      () => {
        resolve();
      },
    );
  });
  console.log('DONE');
}
build();
