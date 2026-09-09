/* eslint-disable */
import { DateTime } from 'luxon';

/* Get the current instant */
const now = DateTime.now();

/**
 * Attachments are common and will be filled from here
 * to keep the demo data maintainable.
 */
const _attachments = {
    media: [
        'assets/images/cards/01-320x200.jpg',
        'assets/images/cards/02-320x200.jpg',
        'assets/images/cards/03-320x200.jpg',
        'assets/images/cards/04-320x200.jpg',
        'assets/images/cards/05-320x200.jpg',
        'assets/images/cards/06-320x200.jpg',
        'assets/images/cards/07-320x200.jpg',
        'assets/images/cards/08-320x200.jpg'
    ],
    docs : [],
    links: []
};

/**
 *  If a message belongs to our user, it's marked by setting it as
 *  'me'. If it belongs to the user we are chatting with, then it
 *  left empty. We will be using this same conversation for each chat
 *  to keep things more maintainable for the demo.
 */
export const messages = [
    {
        id       : 'e6b2b82f-b199-4a60-9696-5f3e40d2715d',
        chatId   : '',
        contactId: 'me',
        value    : 'Hi!',
        createdAt: now.minus({week: 1}).set({hour: 18, minute: 56}).toISO()
    },
    {
        id       : 'eb82cf4b-fa93-4bf4-a88a-99e987ddb7ea',
        chatId   : '',
        contactId: '',
        value    : 'Hey, dude!',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 4}).toISO()
    },
    {
        id       : '3cf9b2a6-ae54-47db-97b2-ee139a8f84e5',
        chatId   : '',
        contactId: '',
        value    : 'Long time no see.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 4}).toISO()
    },
    {
        id       : '2ab91b0f-fafb-45f3-88df-7efaff29134b',
        chatId   : '',
        contactId: 'me',
        value    : 'Yeah, man... Things were quite busy for me and my family.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 6}).toISO()
    },
    {
        id       : '10e81481-378f-49ac-b06b-7c59dcc639ae',
        chatId   : '',
        contactId: '',
        value    : 'What\'s up? Anything I can help with?',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 6}).toISO()
    },
    {
        id       : '3b334e72-6605-4ebd-a4f6-3850067048de',
        chatId   : '',
        contactId: 'me',
        value    : 'We\'ve been on the move, changed 3 places over 4 months',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 7}).toISO()
    },
    {
        id       : '25998113-3a96-4dd0-a7b9-4d2bb58db3f3',
        chatId   : '',
        contactId: '',
        value    : 'Wow! That\'s crazy! 🤯 What happened?',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 7}).toISO()
    },
    {
        id       : '30adb3da-0e4f-487e-aec2-6d9f31e097f6',
        chatId   : '',
        contactId: 'me',
        value    : 'You know I got a job in that big software company. First move was because of that.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 8}).toISO()
    },
    {
        id       : 'c0d6fd6e-d294-4845-8751-e84b8f2c4d3b',
        chatId   : '',
        contactId: 'me',
        value    : 'Then they decided to re-locate me after a month',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 8}).toISO()
    },
    {
        id       : '8d3c442b-62fa-496f-bffa-210ff5c1866b',
        chatId   : '',
        contactId: 'me',
        value    : 'Which was an absolute pain because we just set up everything, house, kids school and all that.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 8}).toISO()
    },
    {
        id       : '3cf26ef0-e81f-4698-ac39-487454413332',
        chatId   : '',
        contactId: 'me',
        value    : 'So we moved the second time.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 9}).toISO()
    },
    {
        id       : '415151b9-9ee9-40a4-a4ad-2d88146bc71b',
        chatId   : '',
        contactId: '',
        value    : 'It\'s crazy!',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 9}).toISO()
    },
    {
        id       : '3a2d3a0e-839b-46e7-86ae-ca0826ecda7c',
        chatId   : '',
        contactId: 'me',
        value    : 'Then this virus thing happened and just after a week we moved in, they decided the whole department will be working remotely.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 10}).toISO()
    },
    {
        id       : '5329c20d-6754-47ec-af8c-660c72be3528',
        chatId   : '',
        contactId: 'me',
        value    : 'And then we decided to move back our first location because, you know, everything was already setup so that\'s the third time.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 10}).toISO()
    },
    {
        id       : '415151b9-9ee9-40a4-a4ad-2d88146bc71b',
        chatId   : '',
        contactId: '',
        value    : 'Ohh dude, I\'m really sorry you had to go through all that in such a short period of time',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 11}).toISO()
    },
    {
        id       : 'ea7662d5-7b72-4c19-ad6c-f80320541001',
        chatId   : '',
        contactId: '',
        value    : '😕',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 11}).toISO()
    },
    {
        id       : '3a2d3a0e-839b-46e7-86ae-ca0826ecda7c',
        chatId   : '',
        contactId: 'me',
        value    : 'Thanks, man! It was good catching up with you.',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 11}).toISO()
    },
    {
        id       : '5329c20d-6754-47ec-af8c-660c72be3528',
        chatId   : '',
        contactId: '',
        value    : 'Yeah dude. Hit me again next week so we can grab a coffee, remotely!',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 12}).toISO()
    },
    {
        id       : '5329c20d-6754-47ec-af8c-660c72be3528',
        chatId   : '',
        contactId: 'me',
        value    : ':) Sure, man! See you next week!',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 12}).toISO()
    },
    {
        id       : '5329c20d-6754-47ec-af8c-660c72be3528',
        chatId   : '',
        contactId: '',
        value    : 'See you later!',
        createdAt: now.minus({week: 1}).set({hour: 19, minute: 12}).toISO()
    },
    {
        id       : 'bab8ca0e-b8e5-4375-807b-1c91fca25a5d',
        chatId   : '',
        contactId: 'me',
        value    : 'Hey! Are you available right now? How about if we grab that coffee today? Remotely, of course :)',
        createdAt: now.set({hour: 12, minute: 45}).toISO()
    },
    {
        id       : '8445a84d-599d-4e2d-a31c-5f4f29ad2b4c',
        chatId   : '',
        contactId: '',
        value    : 'Hi!',
        createdAt: now.set({hour: 12, minute: 56}).toISO()
    },
    {
        id       : '9f506742-50da-4350-af9d-61e53392fa08',
        chatId   : '',
        contactId: '',
        value    : 'Sure thing! I\'m gonna call you in 5, is it okay?',
        createdAt: now.set({hour: 12, minute: 56}).toISO()
    },
    {
        id       : 'ca8523d8-faed-45f7-af09-f6bd5c3f3875',
        chatId   : '',
        contactId: 'me',
        value    : 'Awesome! Call me in 5 minutes..',
        createdAt: now.set({hour: 12, minute: 58}).toISO()
    },
    {
        id       : '39944b00-1ffe-4ffb-8ca6-13c292812e06',
        chatId   : '',
        contactId: '',
        value    : '👍🏻',
        createdAt: now.set({hour: 13, minute: 0}).toISO()
    }
];
export const chats = [
    {
        id           : 'b3facfc4-dfc2-4ac2-b55d-cb70b3e68419',
        contactId    : '6519600a-5eaa-45f8-8bed-c46fddb3b26a',
        unreadCount  : 0,
        muted        : false,
        lastMessage  : 'See you tomorrow!',
        lastMessageAt: '26/04/2021'
    },
    {
        id           : 'e3127982-9e53-4611-ac27-eb70c84be4aa',
        contactId    : 'b62359fd-f2a8-46e6-904e-31052d1cd675',
        unreadCount  : 0,
        muted        : false,
        lastMessage  : 'See you tomorrow!',
        lastMessageAt: '26/04/2021'
    },
];
export const contacts = [

    {
        id         : 'b62359fd-f2a8-46e6-904e-31052d1cd675',
        avatar     : 'assets/images/avatars/male-11.jpg',
        name       : 'Joseph Strickland',
        about      : 'Hi there! I\'m using FuseChat.',
        details    : {
            emails      : [
                {
                    email: 'josephstrickland@mail.io',
                    label: 'Personal'
                },
                {
                    email: 'strickland.joseph@bytrex.us',
                    label: 'Work'
                }
            ],
            phoneNumbers: [
                {
                    country    : 'jo',
                    phoneNumber: '990 450 2729',
                    label      : 'Mobile'
                }
            ],
            title       : 'Hotel Manager',
            company     : 'Bytrex',
            birthday    : '1991-09-08T12:00:00.000Z',
            address     : '844 Ellery Street, Hondah, Texas, PO1272'
        },
        attachments: _attachments
    },
    {
        id         : '6519600a-5eaa-45f8-8bed-c46fddb3b26a',
        background : 'assets/images/cards/24-640x480.jpg',
        name       : 'Mcleod Wagner',
        about      : 'Hi there! I\'m using FuseChat.',
        details    : {
            emails      : [
                {
                    email: 'mcleodwagner@mail.biz',
                    label: 'Personal'
                }
            ],
            phoneNumbers: [
                {
                    country    : 'at',
                    phoneNumber: '977 590 2773',
                    label      : 'Mobile'
                },
                {
                    country    : 'at',
                    phoneNumber: '828 496 3813',
                    label      : 'Work'
                },
                {
                    country    : 'at',
                    phoneNumber: '831 432 2512',
                    label      : 'Home'
                }
            ],
            company     : 'Inrt',
            birthday    : '1980-12-03T12:00:00.000Z',
            address     : '736 Glen Street, Kaka, West Virginia, PO9350'
        },
        attachments: _attachments
    },
  
];
export const profile: any = {
    id    : 'cfaad35d-07a3-4447-a6c3-d8c3d54fd5df',
    name  : 'Brian Hughes',
    email : 'hughes.brian@company.com',
    avatar: 'assets/images/avatars/brian-hughes.jpg',
    about : 'Hi there! I\'m using FuseChat.'
};
