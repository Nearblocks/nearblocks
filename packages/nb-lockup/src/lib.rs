use near_indexer_primitives::types::AccountId;
use near_jsonrpc_client::JsonRpcClient;
use neon::{context::Context, prelude::*};
use once_cell::sync::OnceCell;
use tokio::runtime::Runtime;

mod account_details;
mod lockup;
mod lockup_types;

fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();

    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

async fn get_locked(
    rpc_client: &JsonRpcClient,
    account: &AccountId,
    height: &near_indexer_primitives::types::BlockHeight,
    timestamp: u64,
) -> anyhow::Result<u128> {
    let state = lockup::get_lockup_contract_state(rpc_client, account, &height)
        .await?;
    let code_hash = account_details::get_contract_code_hash(&rpc_client, &account, &height).await?;
    let is_lockup_with_bug = lockup::is_bug_inside_contract(&code_hash, &account);
    let locked_amount = state.get_locked_amount(timestamp, is_lockup_with_bug).0;

    return Ok(locked_amount);
}

fn locked(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rpc_url: Handle<JsString> = cx.argument(0)?;
    let account_id: Handle<JsString> = cx.argument(1)?;
    let block_height: Handle<JsNumber> = cx.argument(2)?;
    let block_timestamp: Handle<JsString> = cx.argument(3)?;

    let rpc_client: JsonRpcClient = JsonRpcClient::connect(rpc_url.value(&mut cx));
    let account: AccountId = account_id.value(&mut cx).parse().unwrap();
    let height = block_height.value(&mut cx) as u64;
    let timestamp = match block_timestamp.value(&mut cx).parse::<u64>() {
        Ok(value) => value,
        Err(_err) => 0
    };

    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    rt.spawn(async move {
        let supply = get_locked(&rpc_client, &account, &height, timestamp).await;

        deferred.settle_with(&channel, move |mut cx| match supply {
            Ok(value) => Ok(cx.string(value.to_string())),
            Err(err) => cx.throw_error(err.to_string()),
        });
    });

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("locked", locked)?;
    Ok(())
}
