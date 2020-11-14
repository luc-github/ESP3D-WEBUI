import { firmwares } from '../../../../constants/firmwares'
export const featuresFormSchema = {
    network: {
        title: 'Network',
        fields: {
            hostname: {
                label: 'Hostname',
                type: 'text',
            },
            radiomode: {
                label: 'Radio mode',
                type: 'select',
                options: [
                    { label: 'Node', value: 0 },
                    { label: 'Client', value: 1 },
                    { label: 'Access point', value: 2 },
                ],
            },
        },
    },
    clientmode: {
        title: 'Client Mode',
        fields: {
            ssid: {
                label: 'SSID',
                type: 'text'
            },
            password: {
                label: 'Password',
                type: 'password'
            },
            ipmode: {
                label: 'IP mode',
                type: 'select',
                options: [
                    { label: 'DHCP', value: 1 },
                    { label: 'Static', value: 0 },
                ]
            },
            ipaddress: {
                label: 'IP address',
                type: 'text'
            },
            gateway: {
                label: 'Gateway',
                type: 'text'
            },
            mask: {
                label: 'Subnet mask',
                type: 'text'
            },
        },
    },
    accessPointMode: {
        title: 'Access point mode',
        fields: {
            ssid: {
                label: 'SSID',
                type: 'text',
            },
            password: {
                label: 'Password',
                type: 'password',
            },
            ipaddress: {
                label: 'IP address',
                type: 'text',
            },
            channel: {
                label: 'Channel',
                type: 'select',
                options: Array.from(Array(14).keys()).map(chan => ({ label: chan + 1, value: chan + 1 }))
            },
        },
    },
    httpProtocol: {
        title: 'HTTP protocol',
        fields: {
            enable: {
                label: 'Field label',
                type: 'text',
            },
            fieldId: {
                label: 'Field label',
                type: 'text',
            },
        },
    },
    model: {
        title: 'title',
        fields: {
            fieldId: {
                label: 'Field label',
                type: 'text', //'switch' 'select' 'checkbox' 'radio'
            },
        },
    },
}