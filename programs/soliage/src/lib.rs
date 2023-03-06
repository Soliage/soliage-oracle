use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("CQ9sBC6dELeBFPtRLS3YM9Zw6K91xDG1drnxzcYG9uYS");

#[program]
pub mod soliage {
    use super::*;

    pub fn create_oracle(ctx: Context<CreateOracle>, parcel_id: u32, amount: u32) -> Result<()> {
        // Get Oracle Account from context
        let oracle = &mut ctx.accounts.oracle;

        // Set the "nft_owner" to the key of the nft_owner account
        oracle.nft_owner = ctx.accounts.nft_owner.key();

        // Set the "nft_address" (from minting)
        oracle.nft_address = ctx.accounts.nft_address.key();

        oracle.amount = amount;
        oracle.parcel_id = parcel_id;

        Ok(())
    }
    pub fn update(ctx: Context<UpdateOracle>, parcel_id: u32, amount: u32) -> Result<()> {
        // Get Oracle Account from context
        let oracle = &mut ctx.accounts.oracle;
        oracle.amount = amount;
        oracle.parcel_id = parcel_id; // consider if this should be updatable at all
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateOracle<'info> {
    #[account(
        init,
        seeds = [b"oracle".as_ref(), nft_owner.key().as_ref(), nft_address.key().as_ref()],
        bump,
        payer = nft_owner,
        space = 8 + size_of::<OracleAccount>()
    )]
    pub oracle: Account<'info, OracleAccount>,

    #[account(mut)]
    pub nft_owner: Signer<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub nft_address: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(mut)]
    pub oracle: Account<'info, OracleAccount>,
}

#[account]
pub struct OracleAccount {
    pub nft_owner: Pubkey,
    pub nft_address: Pubkey,
    pub amount: u32,
    pub parcel_id: u32,
}
