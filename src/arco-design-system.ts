export { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import { DesignSystem } from '@microsoft/fast-foundation';

export function provideArcoDesignSystem(element?: Element) {
  return DesignSystem.getOrCreate(element).withPrefix('a');
}