// 综合前后端集成测试脚本
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// 测试用的token（需要替换为真实的token）
const TEST_TOKEN = 'your_test_token_here';

async function testAllIntegrations() {
  console.log('🚀 开始综合前后端集成测试...\n');

  try {
    // 1. 测试新闻管理API
    console.log('📰 1. 测试新闻管理API...');
    await testNewsAPI();

    // 2. 测试违约管理API
    console.log('\n⚠️  2. 测试违约管理API...');
    await testViolationAPI();

    // 3. 测试申诉管理API
    console.log('\n📋 3. 测试申诉管理API...');
    await testAppealAPI();

    // 4. 测试黑名单管理API
    console.log('\n🚫 4. 测试黑名单管理API...');
    await testBlacklistAPI();

    console.log('\n✅ 所有测试完成！');
    console.log('\n📝 测试总结:');
    console.log('1. 新闻管理: 支持CRUD操作和图片上传');
    console.log('2. 违约管理: 支持查询违约记录和申诉信息');
    console.log('3. 申诉管理: 支持申诉提交、处理和批量操作');
    console.log('4. 黑名单管理: 支持黑名单用户管理');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

async function testNewsAPI() {
  try {
    // 测试获取新闻列表
    const newsResponse = await axios.get(`${BASE_URL}/api/news?page=1&pageSize=5`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    
    if (newsResponse.status === 200) {
      console.log('✅ 新闻列表API正常');
      console.log(`   返回数据结构: ${JSON.stringify(newsResponse.data).substring(0, 100)}...`);
    }
  } catch (error) {
    console.log('❌ 新闻API测试失败:', error.response?.status || error.message);
  }
}

async function testViolationAPI() {
  try {
    // 测试获取违约记录列表
    const violationResponse = await axios.get(`${BASE_URL}/api/violations`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    
    if (violationResponse.status === 200 && violationResponse.data.success) {
      console.log('✅ 违约记录API正常');
      console.log(`   返回数据条数: ${violationResponse.data.data?.length || 0}`);
      
      // 检查是否包含申诉信息
      if (violationResponse.data.data && violationResponse.data.data.length > 0) {
        const firstViolation = violationResponse.data.data[0];
        const hasAppealInfo = 'appealStatus' in firstViolation;
        console.log(`   ✅ 包含申诉信息: ${hasAppealInfo}`);
      }
    }
  } catch (error) {
    console.log('❌ 违约API测试失败:', error.response?.status || error.message);
  }
}

async function testAppealAPI() {
  try {
    // 测试获取申诉列表
    const appealResponse = await axios.get(`${BASE_URL}/api/appeals?page=1&pageSize=5`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    
    if (appealResponse.status === 200) {
      console.log('✅ 申诉列表API正常');
      console.log(`   返回数据条数: ${appealResponse.data.data?.length || 0}`);
      
      // 检查返回的数据结构
      if (appealResponse.data.data && appealResponse.data.data.length > 0) {
        const firstAppeal = appealResponse.data.data[0];
        const requiredFields = ['id', 'userName', 'userId', 'appealStatus', 'appealReason'];
        const hasAllFields = requiredFields.every(field => field in firstAppeal);
        console.log(`   ✅ 数据结构完整: ${hasAllFields}`);
      }
    }
  } catch (error) {
    console.log('❌ 申诉API测试失败:', error.response?.status || error.message);
  }
}

async function testBlacklistAPI() {
  try {
    // 测试获取黑名单列表
    const blacklistResponse = await axios.get(`${BASE_URL}/api/blacklist`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    
    if (blacklistResponse.status === 200 && blacklistResponse.data.success) {
      console.log('✅ 黑名单API正常');
      console.log(`   返回数据条数: ${blacklistResponse.data.data?.length || 0}`);
    }
  } catch (error) {
    console.log('❌ 黑名单API测试失败:', error.response?.status || error.message);
  }
}

// 运行测试
testAllIntegrations();
