import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { LuckyDraw } from '../typechain';

describe('LuckyDraw', function () {
  enum LUCKYDRAW_STATE {
    OPEN = 0,
    CLOSED = 1,
    CALCULATING_WINNER = 2,
  }

  let contract: LuckyDraw;
  let players: SignerWithAddress[];

  beforeEach(async () => {
    [...players] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory('LuckyDraw');
    // contract = contractFactory.attach(`${process.env.SMART_CONTRACT_ADDR}`);
    contract = await contractFactory.deploy(60); // 60 secs
  });

  describe('lucky draw has NOT started', () => {
    it('state should be closed', async () => {
      expect(await contract.luckyDrawState()).equal(LUCKYDRAW_STATE.CLOSED);
    });
    it('lucky draw id should be 0', async () => {
      expect(await contract.luckyDrawId()).equal(0);
    });
    it('player could not enter', async () => {
      await expect(
        contract.enter({
          from: players[0].address,
          value: 1000000000000000,
        }),
      ).to.be.reverted;
    });
  });

  describe('begin a lucky draw', () => {
    it('lucky draw id increases to 1', async () => {
      await contract.startNewLuckyDraw(60 * 5); // 5 minutes
      expect(await contract.luckyDrawId()).equal(1);
    });
    it('player could enter', async () => {
      await contract.startNewLuckyDraw(60 * 5); // 5 minutes
      await contract.enter({
        from: players[0].address,
        value: 1000000000000000,
      });
      expect(await contract.players(0)).equal(players[0].address);
    });
    it('player could not enter if insufficient ether', async () => {
      await contract.startNewLuckyDraw(60 * 5); // 5 minutes
      await expect(
        contract.enter({
          from: players[0].address,
          value: 100000000000000,
        }),
      ).to.be.reverted;
    });
  });
});
