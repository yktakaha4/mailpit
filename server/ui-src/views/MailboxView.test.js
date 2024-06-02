import MailboxView from './MailboxView.vue';
import { mount } from '@vue/test-utils';
import router from '../router';
import axios from 'axios';
import { inspect } from 'util';
import dayjs from "dayjs";

describe('MailboxView', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('should render correctly',async () => {
        const currentDate = dayjs()
        const pageLimit = 50
        const messages = [...Array(100)].map((_, i) => {
            return {
                ID: `ID_${i}`,
                MessageId: `MessageId_${i}@mailpit`,
                Read: false,
                From: {
                    Name: `From Name ${i}`,
                    Address: `from${i}@example.com`,
                },
                To: [{
                    Name: `To Name ${i}`,
                    Address: `to${i}@example.com`,
                }],
                Cc: [],
                Bcc: [],
                ReplyTo: [],
                Subject: `Test subject ${i}`,
                Created: currentDate.subtract(i, 'day').format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                // Created: '2024-06-02T22:52:35.972+09:00',
                Tags: [`tag_group${Math.floor(i / 10)}`, `tag_msg${i}`],
                Size: 100 * i,
                Attachments: [],
                Snippet: `This is a test message ${i}`,
            }
        })

        const response = {
            total: messages.length,
            unread: messages.length,
            count: pageLimit,
            tags: messages.reduce((acc, m) => {
                for (const tag of m.Tags) {
                    if (!acc.includes(tag)) {
                        acc.push(tag)
                    }
                }
                return acc
            }, []),
            messages: messages.slice(0, pageLimit),
            messages_count: pageLimit,
            start: 0,
        }

        vi.spyOn(axios, 'get').mockImplementation(async (url, config) => {
            if (url === '/api/v1/messages' && config.params.limit === pageLimit) {
                return {
                    data: response,
                }
            }
            throw new Error(`Unexpected: url=${url}, config=${inspect(config)}`)
        })

        const wrapper = mount(MailboxView, {
            global: {
                plugins: [router],
            },
        });

        // The screen does not update unless you wait a few ticks.
        // The cause may be in the API result acquisition function.
        // ref: https://github.com/axllent/mailpit/blob/21eef69a60877c17f2d40f6260c7f7844aa24f22/server/ui-src/mixins/CommonMixins.js#L106-L120
        for (let i = 0; i < 5; i++) {
            await wrapper.vm.$nextTick();
        }

        const firstMessage = wrapper.find('#ID_0')
        expect(firstMessage.attributes().href).eq('/view/ID_0');
        expect(firstMessage.html()).contains('from0@example.com');
        expect(firstMessage.html()).contains('to0@example.com');
        expect(firstMessage.html()).contains('Test subject 0');
        expect(firstMessage.html()).contains('This is a test message 0');
        expect(firstMessage.html()).contains('0B');
        expect(firstMessage.html()).contains('a few seconds ago');
        expect(firstMessage.html()).contains('tag_msg0');
        expect(firstMessage.html()).contains('tag_group0');

        const lastMessage = wrapper.find('#ID_49')
        expect(lastMessage.attributes().href).eq('/view/ID_49');
        expect(lastMessage.html()).contains('from49@example.com');
        expect(lastMessage.html()).contains('to49@example.com');
        expect(lastMessage.html()).contains('Test subject 49');
        expect(lastMessage.html()).contains('This is a test message 49');
        expect(lastMessage.html()).contains('4.8 kB');
        expect(lastMessage.html()).contains('2 months ago');
        expect(lastMessage.html()).contains('tag_msg49');
        expect(lastMessage.html()).contains('tag_group4');

        const nav = wrapper.find('.navbar')
        expect(nav.html()).contains('Mailpit');
        expect(nav.text()).contains('1-50 of 100');
    });
});
