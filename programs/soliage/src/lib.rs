use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use std::convert::TryInto;
use std::mem::size_of;


declare_id!("6TcPqJ4w8vNz5SvbfZss5BtjFGstT9X1KjRxqdD5RQwc");

#[program]
pub mod soliage {
    // REPLACE ADDRESS of cot mint by running solana address -k .keys/cot_mint.json
    pub const COT_MINT_ADDRESS: &str = "9rHiiuoPGQGnHBxP8NVCqFxLWj65sQ7JXmPmQ1hfyQJP";
    use super::*;

    pub fn create_oracle(ctx: Context<CreateOracle>, amount: u32) -> Result<()> {
        msg!("Initialising Oracle Account");
        // Get Oracle Account from context
        let oracle = &mut ctx.accounts.oracle;

        // Set the "nft_owner" to the key of the nft_owner account
        oracle.nft_owner = ctx.accounts.nft_owner.key();

        // Set the "nft_address" (from minting)
        oracle.nft_address = ctx.accounts.nft_address.key();

        // Initialize the first amount (percentage green)
        oracle.amount = amount;

        // remember the time
        let clock: u64 = clock::Clock::get()?.unix_timestamp.try_into().unwrap();
        oracle.timestamp = clock;
        msg!("Timestamp: {}", clock);
        Ok(())
    }
    pub fn update(ctx: Context<UpdateOracle>,         
            cot_mint_authority_bump: u8,
            amount: u32) -> Result<()> {
        // Get Oracle Account from context
        let oracle = &mut ctx.accounts.oracle;
        oracle.amount = amount;
        // get the time and compare it to the last time
        let clock: u64 = clock::Clock::get()?.unix_timestamp.try_into().unwrap();
        let delta = clock - oracle.timestamp;
        oracle.timestamp = clock;
        msg!("Delta: {}", delta);
        // determine how much COT NFT holders should get
        let cot_amount = (delta as u64) * (amount as u64) * 100000000; // 1 COT per second per green percentage point
        // We know that:
        //                                  findPDA(programId + seed)
        // cotMintPDA, cotMintPDABump = findPDA(programId + cotMint.address)

        // -> So signer can be found using:
        // findPDA(programId + seed)              = X + bump
        // findPDA(programId + cotMintAddress)  = X + bump
        let cot_mint_address= ctx.accounts.cot_mint.key();
        let seeds = &[cot_mint_address.as_ref(), &[cot_mint_authority_bump]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.cot_mint.to_account_info(),
                to: ctx.accounts.user_cot_token_bag.to_account_info(),
                authority: ctx.accounts.cot_mint_authority.to_account_info(),
            },
            &signer
        );
        token::mint_to(cpi_ctx, cot_amount)?;

        // determine if the COT token account already exists for the NFT holder

        // mint the correct amount of COT into the NFT holder's account
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateOracle<'info> {
    #[account(
        init_if_needed,
        seeds = [b"oracle".as_ref(), nft_address.key().as_ref()],
        bump,
        payer = oracle_provider,
        space = 8 + size_of::<OracleAccount>()
    )]
    pub oracle: Account<'info, OracleAccount>,


    #[account(mut)]
    pub oracle_provider: Signer<'info>,


    /// CHECK: safe
    #[account(mut)]
    pub nft_owner: UncheckedAccount<'info>,
    /// CHECK: safe
    #[account(mut)] // not mutable
    pub nft_address: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(cot_mint_authority_bump: u8)]
pub struct UpdateOracle<'info> {
    // SPL Token Program
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub oracle: Account<'info, OracleAccount>,
    // Address of the cot mint 🏭
    #[account(
        mut,
        address = COT_MINT_ADDRESS.parse::<Pubkey>().unwrap(),
        )]
        pub cot_mint: Account<'info, Mint>,
    
        // The authority allowed to mutate the above ⬆️
        // And Print cot Tokens
        /// CHECK: only used as a signing PDA
        #[account(
        seeds = [ cot_mint.key().as_ref() ],
        bump = cot_mint_authority_bump,
        )]
        pub cot_mint_authority: UncheckedAccount<'info>,
    
        // Associated Token Account 💰 for User to receive COT
        #[account(mut)]
        pub user_cot_token_bag: Account<'info, TokenAccount>,
    }

#[account]
pub struct OracleAccount {
    pub nft_owner: Pubkey,
    pub oracle_provider: Pubkey,
    pub nft_address: Pubkey,
    pub amount: u32,
    pub timestamp: u64,
}
