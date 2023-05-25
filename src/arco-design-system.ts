export { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import { DesignSystem } from '@microsoft/fast-foundation';

export function provideArcoDesignSystem(element?: Element) {
  return DesignSystem.getOrCreate(element).withPrefix('a');
}
export function provideArcoIconDesignSystem(element?: Element) {
  return DesignSystem.getOrCreate(element).withPrefix('icon');
}

// export function provideReactComponents(react: any) {
//   const { wrap } = provideReactWrapper(react, provideFASTDesignSystem());
//   const FastButton = wrap(fastButton());
//   return {
//     FastButton
//   }
// } 
