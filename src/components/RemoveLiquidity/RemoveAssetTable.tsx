import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumberMap, Pool } from '../../types';
import {
    formatNormalizedTokenValue,
    fromPercentage,
    bnum,
} from '../../utils/helpers';

const Wrapper = styled.div`
    width: calc(80% - 20px);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
    margin-top: 32px;
    margin-left: 20px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: left;
    padding: 16px 20px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '30%'};
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
`;

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`;

const MaxLink = styled.div`
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    text-decoration-line: underline;
    color: var(--link-text);
    cursor: pointer;
`;

const WithdrawAmount = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    border-radius: 4px;
`;

const WithdrawWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: right;
    background: var(--panel-background);
    padding: 16px 20px;
    align-self: flex-end;
`;

const WithdrawAmountWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
`;

const InputWrapper = styled.div`
    height: 30px;
    padding: 0px 10px;
    font-style: normal;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    margin: 0px 5px 0px 10px;
    input {
        width: 50px;
        text-align: right;
        color: var(--input-text);
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.2px;
        padding-left: 5px;
        background-color: var(--panel-background);
        border: none;
        box-shadow: inset 0 0 0 1px var(--panel-background),
            inset 0 0 0 70px var(--panel-background);
        :-webkit-autofill,
        :-webkit-autofill:hover,
        :-webkit-autofill:focus,
        :-webkit-autofill:active,
        :-internal-autofill-selected {
            -webkit-text-fill-color: var(--body-text);
        }
        ::placeholder {
            color: var(--input-placeholder-text);
        }
        :focus {
            outline: none;
        }
    }
    border: ${props =>
        props.errorBorders ? '1px solid var(--error-color)' : ''};
    :hover {
        background-color: var(--input-hover-background);
        border: ${props =>
            props.errorBorders
                ? '1px solid var(--error-color)'
                : '1px solid var(--input-hover-border);'};
        input {
            background-color: var(--input-hover-background);
            box-shadow: inset 0 0 0 1px var(--input-hover-background),
                inset 0 0 0 70px var(--input-hover-background);
            ::placeholder {
                color: var(--input-hover-placeholder-text);
                background-color: var(--input-hover-background);
            }
        }
    }
`;

interface Props {
    poolAddress: string;
}

const RemoveAssetsTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            contractMetadataStore,
            removeLiquidityFormStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;

    const pool = poolStore.getPool(poolAddress);
    let userBalances: undefined | BigNumberMap;

    if (pool) {
        userBalances = tokenStore.getAccountBalances(pool.tokensList, account);
    }

    const handleShareToWithdrawChange = event => {
        const { value } = event.target;
        removeLiquidityFormStore.setShareToWithdraw(value);
        if (account && removeLiquidityFormStore.hasValidInput()) {
            removeLiquidityFormStore.validateUserShareInput(
                pool.address,
                account
            );
        }
    };

    const handleMaxLinkClick = async () => {
        const userShare = poolStore.getUserShareProportion(
            pool.address,
            account
        );
        let maxValue = '0.00';

        if (userShare && userShare.gt(0)) {
            maxValue = '100';
        }

        removeLiquidityFormStore.setShareToWithdraw(maxValue);
        if (removeLiquidityFormStore.hasValidInput()) {
            removeLiquidityFormStore.validateUserShareInput(
                pool.address,
                account
            );
        }
    };

    const renderWithdrawInput = () => {
        let existingShare = account
            ? poolStore.getUserShareProportion(pool.address, account)
            : bnum(0);

        if (!existingShare) {
            existingShare = bnum(0);
        }

        const showMaxLink = account && existingShare.gt(0);

        return (
            <WithdrawWrapper>
                <WithdrawAmountWrapper>
                    Percent of my liquidity to withdraw
                    <InputWrapper
                        errorBorders={removeLiquidityFormStore.hasInputError()}
                    >
                        {showMaxLink ? (
                            <MaxLink
                                onClick={() => {
                                    handleMaxLinkClick();
                                }}
                            >
                                Max
                            </MaxLink>
                        ) : (
                            <div />
                        )}
                        <input
                            id={`input-remove-liquidity`}
                            name={`input-name-tokenAddress`}
                            value={removeLiquidityFormStore.getShareToWithdraw()}
                            onChange={e => {
                                handleShareToWithdrawChange(e);
                            }}
                            placeholder=""
                        />
                    </InputWrapper>
                    %
                </WithdrawAmountWrapper>
            </WithdrawWrapper>
        );
    };

    const renderAssetTable = (
        pool: Pool,
        userBalances: undefined | BigNumberMap
    ) => {
        return (
            <React.Fragment>
                {pool.tokensList.map(tokenAddress => {
                    const token = poolStore.getPoolToken(
                        poolAddress,
                        tokenAddress
                    );

                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        tokenAddress
                    );

                    let poolBalanceToDisplay = '-';
                    let withdrawPreviewBalanceText = '-';

                    const precision = contractMetadataStore.getTokenPrecision(
                        token.address
                    );
                    const userLiquidityContribution = poolStore.getUserLiquidityContribution(
                        pool.address,
                        token.address,
                        account
                    );

                    poolBalanceToDisplay = formatNormalizedTokenValue(
                        userLiquidityContribution,
                        precision
                    );

                    if (removeLiquidityFormStore.hasValidInput()) {
                        const tokensToWithdraw = userLiquidityContribution.times(
                            fromPercentage(
                                removeLiquidityFormStore.getShareToWithdraw()
                            )
                        );

                        withdrawPreviewBalanceText = formatNormalizedTokenValue(
                            tokensToWithdraw,
                            precision
                        );
                    }

                    return (
                        <TableRow key={token.address}>
                            <TableCell>
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress,
                                        tokenMetadata.isSupported
                                    )}
                                />
                                {token.symbol}
                            </TableCell>
                            <TableCell>
                                {poolBalanceToDisplay} {token.symbol}
                            </TableCell>
                            <TableCellRight width="40%">
                                <WithdrawAmount>
                                    <div>
                                        {withdrawPreviewBalanceText}{' '}
                                        {token.symbol}
                                    </div>
                                </WithdrawAmount>
                            </TableCellRight>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <HeaderRow>
                <TableCell>Asset</TableCell>
                <TableCell>My Pool Balance</TableCell>
                <TableCellRight width="40%">Withdraw Amount</TableCellRight>
            </HeaderRow>
            {pool &&
            removeLiquidityFormStore.isActivePool(poolAddress) &&
            removeLiquidityFormStore.isActiveAccount(account) ? (
                renderAssetTable(pool, userBalances)
            ) : (
                <TableRow>Loading</TableRow>
            )}
            {renderWithdrawInput()}
        </Wrapper>
    );
});

export default RemoveAssetsTable;
