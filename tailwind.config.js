module.exports = {
    important: true,
    prefix: '',
    purge: [
        '**/*.{html,ts}'
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        zIndex: {
            '5': 5,
            '10': 10,
            '20': 20,
            '30': 30,
            '40': 40,
            '50': 50,
        },
        backgroundSize: {
            'auto': 'auto',
            'cover': 'cover',
            'contain': 'contain',
            '50': '50%',
            '60': '60%',
            '70': '70%',
            '90': '90%',
            '100': '100%',
        },
        extend: {
            backgroundImage: theme => ({
                'verifier': "url('../assets/imgs/Open-Capture_Verifier.svg')",
                'splitter': "url('../assets/imgs/Open-Capture_Splitter.svg')",
            }),
            width:{
                '30': '30%'
            },
            colors: {
                green: {
                    400: '#97BF3D'
                },
                gray: {
                    900: '#4C4C4E',
                    600: '#A7A8AA'
                }
            }
        },
    },
    variants: {
        extend: {
            backgroundColor: ['hover'],
            ringOffsetColor: ['hover'],
            ringOffsetWidth: ['hover'],
            ringOpacity: ['hover'],
            ringColor: ['hover'],
            ringWidth: ['hover']
        }
    },
    plugins: [],
};
