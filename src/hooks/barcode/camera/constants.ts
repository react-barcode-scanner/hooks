export const getUserMediaConstraints = {
    video: { facingMode: 'environment' }
};

export const environmentCameraRegEx: RegExp = new RegExp([
    'achterzijde',
    'arka',
    'arrière',
    'back',
    'bagside',
    'bak',
    'baksidan',
    'belakang',
    'belakang',
    'darrere',
    'hátsó',
    'posteriore',
    'rear',
    'rück',
    'sau',
    'spate',
    'stražnja',
    'takakamera',
    'traseira',
    'trasera',
    'trás',
    'tylny',
    'zadná',
    'zadní',
    'πίσω',
    'задней',
    'задня',
    'אחורית',
    'الخلفية',
    'बैक',
    'หลัง',
    '后置', // alternative
    '后面',
    '後置', // alternative
    '後面',
    '背置', // alternative
    '背面',
    '후'
].join('|'), 'ui');
