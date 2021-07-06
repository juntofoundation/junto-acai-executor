import { TestContext } from './integration.test'

export default function agentTests(testContext: TestContext) {
    return () => {
        describe('basic agent operations', () => {
            it('can get and create agent store', async () => {
                const ad4mClient = testContext.ad4mClient
                
                const generate = await ad4mClient.agent.generate("passphrase")
                expect(generate.isInitialized).toBe(true);
                expect(generate.isUnlocked).toBe(true);
    
                // //Should be able to create a perspective
                // const create = await ad4mClient.perspective.add("test");
                // expect(create.name).toBe("test");
    
                const lockAgent = await ad4mClient.agent.lock("passphrase");
                expect(lockAgent.isInitialized).toBe(true);
                expect(lockAgent.isUnlocked).toBe(false);
    
                // //Should not be able to create a perspective
                // const createLocked = await ad4mClient.perspective.add("test2");
                // console.log(createLocked);
    
                const unlockAgent = await ad4mClient.agent.unlock("passphrase");
                expect(unlockAgent.isInitialized).toBe(true);
                expect(unlockAgent.isUnlocked).toBe(true);
    
                // //Should be able to create a perspective
                // const create = await ad4mClient.perspective.add("test3");
                // expect(create.name).toBe("test3");
    
                const agentDump = await ad4mClient.agent.status();
                expect(agentDump.isInitialized).toBe(true);
                expect(agentDump.isUnlocked).toBe(true);
            })
        })
    }
}