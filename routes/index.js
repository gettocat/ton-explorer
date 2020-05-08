var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  if (req.query.workchain_id && parseInt(req.query.workchain_id) != req.session.workchain_id) {
    //set session
    req.session.workchain_id = parseInt(req.query.workchain_id);
    req.session.save(() => {
      console.log('redirected');
      res.redirect('/');
    })
    return;
  }


  req.ton.queries.blocks.query({
    workchain_id: { eq: req.session.workchain_id }
  }, 'id seq_no prev_key_block_seqno tr_count workchain_id flags gen_utime status_name value_flow { minted,exported, imported,fees_collected}', [{ path: 'seq_no', direction: 'DESC' }], 30)
    .then((data) => {
      res.render('block/list', { title: 'Block list', list: data });
    })
    .catch(e => {
      console.log(e)
    })

});

router.get('/block/:hash', function (req, res, next) {

  let data = { title: 'Ton Block information ' + req.params.hash };
  req.ton.queries.blocks.query({
    workchain_id: { eq: req.session.workchain_id },
    id: { eq: req.params.hash }
  }, 'id status status_name global_id in_msg_descr {msg_id} out_msg_descr {msg_id} want_split seq_no after_merge gen_utime gen_catchain_seqno flags master_ref {end_lt seq_no root_hash file_hash} prev_ref {end_lt seq_no root_hash file_hash} prev_alt_ref {end_lt seq_no root_hash file_hash} prev_vert_ref {end_lt seq_no root_hash file_hash} prev_vert_alt_ref {end_lt seq_no root_hash file_hash} version before_split after_split want_merge vert_seq_no start_lt end_lt workchain_id shard prev_key_block_seqno gen_software_version gen_software_capabilities value_flow { minted,exported, imported,fees_collected} rand_seed account_blocks { account_addr tr_count transactions {transaction_id} old_hash new_hash tr_count} tr_count state_update {new_hash new_depth old_hash old_depth} master {min_shard_gen_utime max_shard_gen_utime shard_hashes {shard, workchain_id} shard_fees {workchain_id, fees, fees_other {currency, value}, create, create_other{currency, value}} config_addr } signatures {proof, validator_list_hash_short, signatures{node_id, r, s}}', [], 1)
    .then((blocks) => {
      if (!blocks.length)
        throw new Error('Invalid hash');

      data.block = blocks[0];
      console.log(data.block);

      return req.ton.queries.transactions.query({
        block_id: { eq: data.block.id }
      }, 'id  tr_type  tr_type_name  status  status_name  block_id  account_addr  workchain_id  lt  prev_trans_hash  prev_trans_lt  now  outmsg_cnt  orig_status  orig_status_name  end_status  end_status_name in_msg  out_msgs total_fees total_fees_other {currency, value} old_hash new_hash credit_first storage {status_change_name, storage_fees_due, storage_fees_collected} credit {due_fees_collected, credit, credit_other{currency, value}} compute {compute_type_name, success} action {success valid no_funds status_change status_change_name total_fwd_fees total_action_fees result_code result_arg tot_actions spec_actions skipped_actions msgs_created action_list_hash total_msg_size_cells total_msg_size_bits} bounce {bounce_type_name } aborted  destroyed tt split_info {this_addr sibling_addr cur_shard_pfx_len acc_split_depth} prepare_transaction installed  proof  boc')

    })
    .then((txs) => {
      let arr = {};
      for (let i in txs) {
        arr[txs[i].id] = txs[i]
      }
      data.txs = arr;
      console.log(txs);
      res.render('block/item', data);
    })
    .catch(e => {
      console.log(e)
    })

});


router.get('/tx/:hash', function (req, res, next) {

  let data = { title: 'Ton transaction information ' + req.params.hash };
  req.ton.queries.transactions.query({
    id: { eq: req.params.hash }
  }, 'id  tr_type  tr_type_name  status  status_name  block_id  account_addr  workchain_id  lt  prev_trans_hash  prev_trans_lt  now  outmsg_cnt  orig_status  orig_status_name  end_status  end_status_name in_msg  out_msgs total_fees total_fees_other {currency, value} old_hash new_hash credit_first storage {status_change_name, storage_fees_due, storage_fees_collected} credit {due_fees_collected, credit, credit_other{currency, value}} compute {compute_type_name, success} action {success valid no_funds status_change status_change_name total_fwd_fees total_action_fees result_code result_arg tot_actions spec_actions skipped_actions msgs_created action_list_hash total_msg_size_cells total_msg_size_bits} bounce {bounce_type_name } aborted  destroyed tt split_info {this_addr sibling_addr cur_shard_pfx_len acc_split_depth} prepare_transaction installed  proof  boc', [], 1)
    .then((txs) => {
      if (!txs.length)
        throw new Error('Invalid hash');

      data.tx = txs[0];
      console.log(data.tx);
      res.render('tx/item', data);
    })

});

router.get('/message/:hash', function (req, res, next) {

  let data = { title: 'Ton message information ' + req.params.hash };
  req.ton.queries.messages.query({
    id: { eq: req.params.hash }
  }, 'id msg_type msg_type_name status status_name block_id body split_depth tick tock code data library src dst src_workchain_id dst_workchain_id created_at ihr_disabled ihr_fee fwd_fee import_fee bounce bounced value value_other {currency value} proof boc src_transaction {id account_addr} dst_transaction {id account_addr}', [], 1)
    .then((msgs) => {
      if (!msgs.length)
        throw new Error('Invalid hash');

      data.msg = msgs[0];
      console.log(data.msg);
      res.render('message/item', data);
    })
    .catch(e => {
      console.log(e)
    })

});


router.get('/account/:hash', function (req, res, next) {

  let data = { title: 'Ton account information ' + req.params.hash };
  req.ton.queries.accounts.query({
    id: { eq: req.params.hash }
  }, 'id workchain_id acc_type acc_type_name last_paid due_payment last_trans_lt balance balance_other {currency, value} split_depth tick tock code data library proof boc', [], 1)
    .then((msgs) => {
      if (!msgs.length)
        throw new Error('Invalid hash');

      data.account = msgs[0];

      req.ton.queries.transactions.query({
        account_addr: { eq: req.params.hash }
      }, 'id  tr_type  tr_type_name  status  status_name  block_id  account_addr  workchain_id  lt  prev_trans_hash  prev_trans_lt  now  outmsg_cnt  orig_status  orig_status_name  end_status  end_status_name in_msg  out_msgs total_fees total_fees_other {currency, value} old_hash new_hash credit_first storage {status_change_name, storage_fees_due, storage_fees_collected} credit {due_fees_collected, credit, credit_other{currency, value}} compute {compute_type_name, success} action {success valid no_funds status_change status_change_name total_fwd_fees total_action_fees result_code result_arg tot_actions spec_actions skipped_actions msgs_created action_list_hash total_msg_size_cells total_msg_size_bits} bounce {bounce_type_name } aborted  destroyed tt split_info {this_addr sibling_addr cur_shard_pfx_len acc_split_depth} prepare_transaction installed  proof  boc', [], 1)
        .then((txs) => {
          data.txs = txs;

          return req.ton.queries.messages.query({
            src: { eq: req.params.hash },
            OR: {
              dst: { eq: req.params.hash }
            }
          }, 'id msg_type msg_type_name status status_name block_id body split_depth tick tock code data library src dst src_workchain_id dst_workchain_id created_at ihr_disabled ihr_fee fwd_fee import_fee bounce bounced value value_other {currency value} proof boc src_transaction {id account_addr} dst_transaction {id account_addr}', [], 1)

        })
        .then((msgs) => {
          data.messages = msgs;
          console.log('msg', msgs);
          res.render('accounts/item', data);
        });

    })
    .catch(e => {
      console.log(e)
    })

});

module.exports = router;
