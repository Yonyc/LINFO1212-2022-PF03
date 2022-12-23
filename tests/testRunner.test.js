import { testSuite1, testSuite2 } from './user'
import { testSuite3 } from './therapist'

describe('sequentially run tests', () => {
   testSuite1()
   testSuite2()
   testSuite3()
})