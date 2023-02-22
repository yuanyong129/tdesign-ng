import {  } from '@microsoft/fast-colors';

const BaseColors = new Map();

export const getBaseColor = (type: string) => {
  return `rgb(${BaseColors.get(type)})`;
}

BaseColors.set('--red-1', '255,236,232');
BaseColors.set('--red-2', '253,205,197');
BaseColors.set('--red-3', '251,172,163');
BaseColors.set('--red-4', '249,137,129');
BaseColors.set('--red-5', '247,101,96');
BaseColors.set('--red-6', '245,63,63');
BaseColors.set('--red-7', '203,39,45');
BaseColors.set('--red-8', '161,21,30');
BaseColors.set('--red-9', '119,8,19');
BaseColors.set('--red-10', '77,0,10');
    // --orangered-1: 255,243,232;
    // --orangered-2: 253,221,195;
    // --orangered-3: 252,197,159;
    // --orangered-4: 250,172,123;
    // --orangered-5: 249,144,87;
    // --orangered-6: 247,114,52;
    // --orangered-7: 204,81,32;
    // --orangered-8: 162,53,17;
    // --orangered-9: 119,31,6;
    // --orangered-10: 77,14,0;
BaseColors.set('--orange-1', '255,247,232');
BaseColors.set('--orange-2', '255,228,186');
BaseColors.set('--orange-3', '255,207,139');
BaseColors.set('--orange-4', '255,182,93');
BaseColors.set('--orange-5', '255,154,46');
BaseColors.set('--orange-6', '255,125,0');
BaseColors.set('--orange-7', '210,95,0');
BaseColors.set('--orange-8', '166,69,0');
BaseColors.set('--orange-9', '121,46,0');
BaseColors.set('--orange-10', '77,27,0');
    // --gold-1: 255,252,232;
    // --gold-2: 253,244,191;
    // --gold-3: 252,233,150;
    // --gold-4: 250,220,109;
    // --gold-5: 249,204,69;
    // --gold-6: 247,186,30;
    // --gold-7: 204,146,19;
    // --gold-8: 162,109,10;
    // --gold-9: 119,75,4;
    // --gold-10: 77,45,0;
    // --yellow-1: 254,255,232;
    // --yellow-2: 254,254,190;
    // --yellow-3: 253,250,148;
    // --yellow-4: 252,242,107;
    // --yellow-5: 251,232,66;
    // --yellow-6: 250,220,25;
    // --yellow-7: 207,175,15;
    // --yellow-8: 163,132,8;
    // --yellow-9: 120,93,3;
    // --yellow-10: 77,56,0;
    // --lime-1: 252,255,232;
    // --lime-2: 237,248,187;
    // --lime-3: 220,241,144;
    // --lime-4: 201,233,104;
    // --lime-5: 181,226,65;
    // --lime-6: 159,219,29;
    // --lime-7: 126,183,18;
    // --lime-8: 95,148,10;
    // --lime-9: 67,112,4;
    // --lime-10: 42,77,0;
BaseColors.set('--green-1', '232,255,234');
BaseColors.set('--green-2', '175,240,181');
BaseColors.set('--green-3', '123,225,136');
BaseColors.set('--green-4', '76,210,99');
BaseColors.set('--green-5', '35,195,67');
BaseColors.set('--green-6', '0,180,42');
BaseColors.set('--green-7', '0,154,41');
BaseColors.set('--green-8', '0,128,38');
BaseColors.set('--green-9', '0,102,34');
BaseColors.set('--green-10', '0,77,28');
    // --cyan-1: 232,255,251;
    // --cyan-2: 183,244,236;
    // --cyan-3: 137,233,224;
    // --cyan-4: 94,223,214;
    // --cyan-5: 55,212,207;
    // --cyan-6: 20,201,201;
    // --cyan-7: 13,165,170;
    // --cyan-8: 7,130,139;
    // --cyan-9: 3,97,108;
    // --cyan-10: 0,66,77;
    // --blue-1: 232,247,255;
    // --blue-2: 195,231,254;
    // --blue-3: 159,212,253;
    // --blue-4: 123,192,252;
    // --blue-5: 87,169,251;
    // --blue-6: 52,145,250;
    // --blue-7: 32,108,207;
    // --blue-8: 17,75,163;
    // --blue-9: 6,48,120;
    // --blue-10: 0,26,77;
BaseColors.set('--arcoblue-1', '232,243,255');
BaseColors.set('--arcoblue-2', '190,218,255');
BaseColors.set('--arcoblue-3', '148,191,255');
BaseColors.set('--arcoblue-4', '106,161,255');
BaseColors.set('--arcoblue-5', '64,128,255');
BaseColors.set('--arcoblue-6', '22,93,255');
BaseColors.set('--arcoblue-7', '14,66,210');
BaseColors.set('--arcoblue-8', '7,44,166');
BaseColors.set('--arcoblue-9', '3,26,121');
BaseColors.set('--arcoblue-10', '0,13,77');
    // --purple-1: 245,232,255;
    // --purple-2: 221,190,246;
    // --purple-3: 195,150,237;
    // --purple-4: 168,113,227;
    // --purple-5: 141,78,218;
    // --purple-6: 114,46,209;
    // --purple-7: 85,29,176;
    // --purple-8: 60,16,143;
    // --purple-9: 39,6,110;
    // --purple-10: 22,0,77;
    // --pinkpurple-1: 255,232,251;
    // --pinkpurple-2: 247,186,239;
    // --pinkpurple-3: 240,142,230;
    // --pinkpurple-4: 232,101,223;
    // --pinkpurple-5: 225,62,219;
    // --pinkpurple-6: 217,26,217;
    // --pinkpurple-7: 176,16,182;
    // --pinkpurple-8: 138,9,147;
    // --pinkpurple-9: 101,3,112;
    // --pinkpurple-10: 66,0,77;
    // --magenta-1: 255,232,241;
    // --magenta-2: 253,194,219;
    // --magenta-3: 251,157,199;
    // --magenta-4: 249,121,183;
    // --magenta-5: 247,84,168;
    // --magenta-6: 245,49,157;
    // --magenta-7: 203,30,131;
    // --magenta-8: 161,16,105;
    // --magenta-9: 119,6,79;
    // --magenta-10: 77,0,52;
BaseColors.set('--gray-1', '247,248,250');
BaseColors.set('--gray-2', '242,243,245');
BaseColors.set('--gray-3', '229,230,235');
BaseColors.set('--gray-4', '201,205,212');
BaseColors.set('--gray-5', '169,174,184');
BaseColors.set('--gray-6', '134,144,156');
BaseColors.set('--gray-7', '107,119,133');
BaseColors.set('--gray-8', '78,89,105');
BaseColors.set('--gray-9', '39,46,59');
BaseColors.set('--gray-10', '29,33,41');


const TypeColors = new Map();

export const getTypeColors = (type: string) => {
  return TypeColors.get(type);
}

for (let i = 1; i <= 10; i++) {
  TypeColors.set(`--primary-${i}`, getBaseColor(`--arcoblue-${i}`));
  TypeColors.set(`--success-${i}`, getBaseColor(`--green-${i}`));
  TypeColors.set(`--warning-${i}`, getBaseColor(`--orange-${i}`));
  TypeColors.set(`--danger-${i}`, getBaseColor(`--red-${i}`));
}


const DefaultColors = new Map();

export const getDefaultColor = (type: string) => {
  return DefaultColors.get(type);
}


for(let i = 1; i <= 10; i ++) {
  DefaultColors.set(`--color-neutral-${i}`, getBaseColor(`--gray-${i}`));
}

DefaultColors.set('--color-text-1', getDefaultColor('--color-neutral-10'));
DefaultColors.set('--color-text-2', getDefaultColor('--color-neutral-8'));
DefaultColors.set('--color-text-3', getDefaultColor('--color-neutral-6'));
DefaultColors.set('--color-text-4', getDefaultColor('--color-neutral-4'));
DefaultColors.set('--color-border-1', getDefaultColor('--color-neutral-2'));
DefaultColors.set('--color-border-2', getDefaultColor('--color-neutral-3'));
DefaultColors.set('--color-border-3', getDefaultColor('--color-neutral-4'));
DefaultColors.set('--color-border-4', getDefaultColor('--color-neutral-6'));
DefaultColors.set('--color-fill-1', getDefaultColor('--color-neutral-1'));
DefaultColors.set('--color-fill-2', getDefaultColor('--color-neutral-2'));
DefaultColors.set('--color-fill-3', getDefaultColor('--color-neutral-3'));
DefaultColors.set('--color-fill-4', getDefaultColor('--color-neutral-4'));

for(let i = 1; i < 5; i ++) {
  DefaultColors.set(`--color-danger-light-${i}`, getTypeColors(`--danger-${i}`));
  DefaultColors.set(`--color-success-light-${i}`, getTypeColors(`--success-${i}`));
  DefaultColors.set(`--color-warning-light-${i}`, getTypeColors(`--warning-${i}`));
}
