/**
 * Component Logic Audit Script (T012)
 * 
 * Uses ts-morph to parse TypeScript AST and extract component logic signatures.
 * Identifies:
 * - Props interface
 * - State variables (useState)
 * - Event handlers (onClick, onChange, etc.)
 * - Effects (useEffect)
 * - API calls (fetch, axios)
 * - Router usage (useRouter, router.push)
 * - Conditional rendering
 * 
 * Output: specs/005-comprehensive-css-class/logic-audit/[ComponentName].md
 * 
 * Usage: npx tsx scripts/audit-component-logic.ts src/components/Button.tsx
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

interface ComponentLogic {
  componentName: string;
  filePath: string;
  props: Array<{ name: string; type: string; required: boolean }>;
  state: Array<{ name: string; initialValue: string; setter: string }>;
  effects: Array<{ dependencies: string[]; body: string }>;
  handlers: Array<{ name: string; params: string; body: string }>;
  apiCalls: Array<{ method: string; url: string; location: string }>;
  routerUsage: Array<{ type: 'push' | 'replace' | 'back' | 'navigate'; location: string }>;
  conditionalRendering: Array<{ condition: string; location: string }>;
  riskLevel: 'low' | 'medium' | 'high';
}

function analyzeComponent(filePath: string): ComponentLogic {
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
  });
  
  const sourceFile = project.addSourceFileAtPath(filePath);
  const componentName = path.basename(filePath, path.extname(filePath));
  
  const logic: ComponentLogic = {
    componentName,
    filePath,
    props: [],
    state: [],
    effects: [],
    handlers: [],
    apiCalls: [],
    routerUsage: [],
    conditionalRendering: [],
    riskLevel: 'low',
  };
  
  // Find component function/export
  const exportedDeclarations = sourceFile.getExportedDeclarations();
  
  exportedDeclarations.forEach((declarations) => {
    declarations.forEach((declaration) => {
      // Extract props interface
      if (Node.isInterfaceDeclaration(declaration) || Node.isTypeAliasDeclaration(declaration)) {
        const type = declaration.getType();
        const properties = type.getProperties();
        
        properties.forEach(prop => {
          const propType = prop.getTypeAtLocation(declaration);
          logic.props.push({
            name: prop.getName(),
            type: propType.getText(),
            required: !prop.isOptional(),
          });
        });
      }
      
      // Extract function component logic
      if (Node.isFunctionDeclaration(declaration) || Node.isArrowFunction(declaration) || Node.isFunctionExpression(declaration)) {
        const body = declaration.getBody();
        
        if (body) {
          // Find useState calls
          body.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
            const expr = call.getExpression();
            if (expr.getText() === 'useState') {
              const initialValue = call.getArguments()[0]?.getText() || 'undefined';
              const parent = call.getParent();
              if (Node.isVariableDeclaration(parent)) {
                const name = parent.getName();
                const binding = parent.getNameNode();
                if (Node.isArrayBindingPattern(binding)) {
                  const elements = binding.getElements();
                  logic.state.push({
                    name: elements[0]?.getText() || name,
                    initialValue,
                    setter: elements[1]?.getText() || `set${name.charAt(0).toUpperCase() + name.slice(1)}`,
                  });
                }
              }
            }
          });
          
          // Find useEffect calls
          body.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
            const expr = call.getExpression();
            if (expr.getText() === 'useEffect') {
              const effectFn = call.getArguments()[0];
              const deps = call.getArguments()[1];
              logic.effects.push({
                dependencies: deps ? deps.getText().replace(/[\[\]]/g, '').split(',').map(d => d.trim()) : [],
                body: effectFn?.getText().substring(0, 100) || '...',
              });
            }
          });
          
          // Find event handlers (arrow functions assigned to const)
          body.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach(varDecl => {
            const initializer = varDecl.getInitializer();
            if (initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
              const name = varDecl.getName();
              if (name.startsWith('handle') || name.startsWith('on')) {
                logic.handlers.push({
                  name,
                  params: initializer.getParameters().map(p => p.getText()).join(', '),
                  body: initializer.getBody()?.getText().substring(0, 100) || '...',
                });
              }
            }
          });
          
          // Find fetch/axios calls
          body.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
            const expr = call.getExpression();
            const exprText = expr.getText();
            if (exprText === 'fetch' || exprText.includes('axios')) {
              const urlArg = call.getArguments()[0];
              logic.apiCalls.push({
                method: exprText.includes('axios') ? 'axios' : 'fetch',
                url: urlArg?.getText() || 'unknown',
                location: call.getStartLineNumber().toString(),
              });
            }
          });
          
          // Find router usage
          body.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
            const expr = call.getExpression();
            const exprText = expr.getText();
            if (exprText.includes('router.push') || exprText.includes('router.replace')) {
              logic.routerUsage.push({
                type: exprText.includes('push') ? 'push' : 'replace',
                location: call.getStartLineNumber().toString(),
              });
            }
            if (expr.getText() === 'useRouter') {
              logic.routerUsage.push({
                type: 'navigate',
                location: call.getStartLineNumber().toString(),
              });
            }
          });
          
          // Find conditional rendering (ternary, logical-and)
          body.getDescendantsOfKind(SyntaxKind.ConditionalExpression).forEach(ternary => {
            logic.conditionalRendering.push({
              condition: ternary.getCondition().getText(),
              location: ternary.getStartLineNumber().toString(),
            });
          });
          
          body.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(binary => {
            if (binary.getOperatorToken().getText() === '&&') {
              logic.conditionalRendering.push({
                condition: binary.getLeft().getText(),
                location: binary.getStartLineNumber().toString(),
              });
            }
          });
        }
      }
    });
  });
  
  // Calculate risk level
  let riskScore = 0;
  if (logic.state.length > 3) riskScore += 2;
  if (logic.effects.length > 2) riskScore += 2;
  if (logic.handlers.length > 5) riskScore += 1;
  if (logic.apiCalls.length > 0) riskScore += 3;
  if (logic.routerUsage.length > 0) riskScore += 2;
  if (logic.conditionalRendering.length > 5) riskScore += 1;
  
  if (riskScore >= 7) logic.riskLevel = 'high';
  else if (riskScore >= 4) logic.riskLevel = 'medium';
  else logic.riskLevel = 'low';
  
  return logic;
}

function generateMarkdownReport(logic: ComponentLogic): string {
  let md = `# Component Logic Audit: ${logic.componentName}\n\n`;
  md += `**File**: ${logic.filePath}\n`;
  md += `**Risk Level**: ${logic.riskLevel.toUpperCase()} ⚠️\n\n`;
  
  md += `## Props Interface\n\n`;
  if (logic.props.length === 0) {
    md += `No props detected.\n\n`;
  } else {
    md += `| Prop Name | Type | Required |\n`;
    md += `|-----------|------|----------|\n`;
    logic.props.forEach(p => {
      md += `| \`${p.name}\` | \`${p.type}\` | ${p.required ? '✅ Yes' : '❌ No'} |\n`;
    });
    md += `\n`;
  }
  
  md += `## State Variables (useState)\n\n`;
  if (logic.state.length === 0) {
    md += `No state variables detected.\n\n`;
  } else {
    md += `| Variable | Initial Value | Setter |\n`;
    md += `|----------|---------------|--------|\n`;
    logic.state.forEach(s => {
      md += `| \`${s.name}\` | \`${s.initialValue}\` | \`${s.setter}\` |\n`;
    });
    md += `\n`;
  }
  
  md += `## Event Handlers\n\n`;
  if (logic.handlers.length === 0) {
    md += `No event handlers detected.\n\n`;
  } else {
    md += `| Handler Name | Parameters | Body Preview |\n`;
    md += `|--------------|------------|---------------|\n`;
    logic.handlers.forEach(h => {
      md += `| \`${h.name}\` | \`${h.params}\` | \`${h.body.substring(0, 50)}...\` |\n`;
    });
    md += `\n`;
  }
  
  md += `## Effects (useEffect)\n\n`;
  if (logic.effects.length === 0) {
    md += `No effects detected.\n\n`;
  } else {
    md += `| Dependencies | Body Preview |\n`;
    md += `|--------------|---------------|\n`;
    logic.effects.forEach(e => {
      md += `| \`${JSON.stringify(e.dependencies)}\` | \`${e.body.substring(0, 50)}...\` |\n`;
    });
    md += `\n`;
  }
  
  md += `## API Calls\n\n`;
  if (logic.apiCalls.length === 0) {
    md += `No API calls detected.\n\n`;
  } else {
    md += `| Method | URL | Line |\n`;
    md += `|--------|-----|------|\n`;
    logic.apiCalls.forEach(a => {
      md += `| \`${a.method}\` | \`${a.url}\` | ${a.location} |\n`;
    });
    md += `\n`;
  }
  
  md += `## Router Usage\n\n`;
  if (logic.routerUsage.length === 0) {
    md += `No router usage detected.\n\n`;
  } else {
    md += `| Type | Line |\n`;
    md += `|------|------|\n`;
    logic.routerUsage.forEach(r => {
      md += `| \`${r.type}\` | ${r.location} |\n`;
    });
    md += `\n`;
  }
  
  md += `## Conditional Rendering\n\n`;
  if (logic.conditionalRendering.length === 0) {
    md += `No conditional rendering detected.\n\n`;
  } else {
    md += `| Condition | Line |\n`;
    md += `|-----------|------|\n`;
    logic.conditionalRendering.forEach(c => {
      md += `| \`${c.condition}\` | ${c.location} |\n`;
    });
    md += `\n`;
  }
  
  md += `## Logic Preservation Checklist\n\n`;
  md += `When migrating this component to shadcn/ui, ensure:\n\n`;
  logic.props.forEach(p => {
    md += `- [ ] Preserve prop: \`${p.name}\`\n`;
  });
  logic.state.forEach(s => {
    md += `- [ ] Preserve state variable: \`${s.name}\`\n`;
  });
  logic.handlers.forEach(h => {
    md += `- [ ] Preserve event handler: \`${h.name}\`\n`;
  });
  logic.effects.forEach((e, i) => {
    md += `- [ ] Preserve useEffect #${i + 1}\n`;
  });
  logic.apiCalls.forEach((a, i) => {
    md += `- [ ] Preserve API call #${i + 1}: \`${a.method}\`\n`;
  });
  logic.routerUsage.forEach((r, i) => {
    md += `- [ ] Preserve router navigation #${i + 1}\n`;
  });
  logic.conditionalRendering.forEach((c, i) => {
    md += `- [ ] Preserve conditional render #${i + 1}\n`;
  });
  
  return md;
}

async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ Error: Please provide a file path');
    console.log('Usage: npx tsx scripts/audit-component-logic.ts src/components/Button.tsx');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`🔍 Analyzing component logic: ${filePath}\n`);
  
  const logic = analyzeComponent(filePath);
  const markdown = generateMarkdownReport(logic);
  
  const outputDir = path.join('specs', '005-comprehensive-css-class', 'logic-audit');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${logic.componentName}.md`);
  fs.writeFileSync(outputPath, markdown);
  
  console.log(`✅ Logic audit complete!`);
  console.log(`📊 Report saved to: ${outputPath}`);
  console.log(`\nRisk Level: ${logic.riskLevel.toUpperCase()}`);
  console.log(`  - Props: ${logic.props.length}`);
  console.log(`  - State: ${logic.state.length}`);
  console.log(`  - Handlers: ${logic.handlers.length}`);
  console.log(`  - Effects: ${logic.effects.length}`);
  console.log(`  - API Calls: ${logic.apiCalls.length}\n`);
}

main().catch(console.error);
