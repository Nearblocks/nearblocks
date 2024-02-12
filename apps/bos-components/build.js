import fs from 'fs';
import fsp from 'fs/promises';
import replaceInFiles from 'replace-in-files';

const basePath = '.bos/transpiled';
const transpiledPathPrefix = '.bos/transpiled/src/bos-components';

async function build() {
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
      const importRegex = /import\s+(\w+)\s+from\s+'@\/includes\/([^']*)';/;

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
    from: /import\s+(\w+)\s+from\s+'@\/includes\/([^']*)';/gm,
    to: (_match) => {
      // extract component name and path to the imported component
      const [component, componentName, componentPath] = _match.match(
        /import\s+(\w+)\s+from\s+'@\/includes\/([^']*)';/,
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
    from: /import\s+{[^}]*}\s+from\s+'@\/includes\/([^']*)';/gm,
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
      let fileImported = '';
      // loops through each function name to extract function content
      extractedNames.forEach(function (name, index) {
        const functionName = `${name.trim()}`;

        const regex = new RegExp(
          `function\\s+${functionName}\\s*\\([^)]*\\)\\s*{([^]*)}`,
          's',
        );

        const match = importedFileContent.match(regex);
        if (match) {
          contentImport = match[0] + '\n';
        }
        // check if any imported functions used in the etracted content
        fileImported += processFileImports(contentImport, importedFileContent);
      });
      return `/* INCLUDE: "includes/${importPath}.jsx" */\n${fileImported}/* END_INCLUDE: "includes/${importPath}.jsx" */`;
    },
  });

  const packageJson = JSON.parse(
    fs.readFileSync(new URL('./package.json', import.meta.url)),
  );
  const newPath = `${basePath}/common/src/${packageJson.name}`;

  await fsp.rename(transpiledPathPrefix, newPath);
  await fsp.rename(
    `${newPath}/components/Address`,
    `${basePath}/address/src/bos-components/components/Address`,
  );
  await fsp.rename(
    `${newPath}/components/Blocks`,
    `${basePath}/blocks/src/bos-components/components/Blocks`,
  );
  await fsp.rename(
    `${newPath}/components/FT`,
    `${basePath}/ft/src/bos-components/components/FT`,
  );
  await fsp.rename(
    `${newPath}/components/NFT`,
    `${basePath}/nft/src/bos-components/components/NFT`,
  );
  await fsp.rename(
    `${newPath}/components/Transactions`,
    `${basePath}/txn/src/bos-components/components/Transactions`,
  );

  console.log('DONE');
}
build();
