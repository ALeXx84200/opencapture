/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

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
            width: {
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
