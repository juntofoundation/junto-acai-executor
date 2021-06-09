import { v4 as uuidv4 } from 'uuid'
import faker from 'faker'
import type Link from '@perspect3vism/ad4m/Links'
import type { LinkQuery } from '@perspect3vism/ad4m/Links'
import Memory from 'lowdb/adapters/Memory'
import type LanguageRef from '@perspect3vism/ad4m/LanguageRef'
import { createLink } from './testutils/links'
import create from "./core/PerspectivismCore";
import { LinksAdapter } from '@perspect3vism/ad4m/Language'
import { createMockExpression } from './testutils/expression'
import Expression from '@perspect3vism/ad4m/Expression'

const DATA_RESOURCE_PATH = `${__dirname}/test-temp`
const LANG_TO_TEST = "social-context-channel"

jest.setTimeout(15000)

const core = new create({
    appDataPath: DATA_RESOURCE_PATH,
    appResourcePath: DATA_RESOURCE_PATH,
    builtInLangPath: DATA_RESOURCE_PATH,
    builtInLangs: [LANG_TO_TEST]
})

describe(LANG_TO_TEST, () => {

    beforeAll(async () => {
        await core.initServices()
        await core.agentService.createNewKeys()
        core.agentService.save('')
        core.initControllers()
        await core.initLanguages(true)
    })

    afterAll(async () => {
        await core.exit()
        await new Promise((resolve)=>setTimeout(resolve, 1000))
    })

    it('has a linksAdapter', (done) => {
        const langs = core.languageController.getLanguagesWithLinksAdapter()
        expect(langs.length).toEqual(1)
        expect(langs[0].name).toEqual(LANG_TO_TEST)
        done()
    })

    describe('after adding 5 links', () => {
        let allLinks = [] as Expression[]
        let linkLanguage: LinksAdapter

        beforeAll(async () => {
            const langs = core.languageController.getLanguagesWithLinksAdapter()
            const maybeLang = core.languageController.getLinksAdapter(langs[0])
            if(!maybeLang) throw "Couldn't get linksAdapter of test language"
            else linkLanguage = maybeLang

            const did = "did:test:link-author"
            for(let i=0; i<5; i++) {
                const link = createLink()
                if(i%2 === 0) {
                    link.source = 'root'
                }

                const linkExpression = createMockExpression(did, link)
                allLinks.push(linkExpression)
                await linkLanguage.addLink(linkExpression)
            }
        })


        it('can get a link by source', async () => {
            const addedLink = allLinks[0]
            const source = addedLink.data['source']
            const result = await linkLanguage.getLinks({source} as LinkQuery)
            expect(result.length).toEqual(1)
            expect(result[0]).toEqual(addedLink)
        })


        it('can get a link by predicate', async () => {
            const addedLink = allLinks[0]
            const predicate = addedLink.data['predicate']
            const result = await linkLanguage.getLinks({predicate} as LinkQuery)
            expect(result.length).toEqual(1)
            expect(result[0]).toEqual(addedLink)
        })

        it('can get a link by target', async () => {
            const addedLink = allLinks[0]
            const target = addedLink.data['target']
            const result = await linkLanguage.getLinks({target} as LinkQuery)
            expect(result.length).toEqual(1)
            expect(result[0]).toEqual(addedLink)
        })

        it('can get multiple links by source', async () => {
            const result = await linkLanguage.getLinks({source: 'root'} as LinkQuery)
            expect(result.length).toEqual(3)
        })

        it('can get all links', async () => {
            const result = await linkLanguage.getLinks({} as LinkQuery)

            expect(result.length).toEqual(5)

            for(let i=0; i<5; i++) {
                expect(result).toEqual(
                    expect.arrayContaining(
                        [expect.objectContaining({data: allLinks[i]})]
                    )
                )
            }
        })
    })
})








